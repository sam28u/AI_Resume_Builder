import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const resumeSchema = z.object({
  professionalSummary: z.string().describe("A strong, ATS-friendly summary paragraph."),
  tailoredExperiences: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      optimizedBullets: z.array(z.string()).describe("Action-oriented bullets incorporating JD keywords."),
    })
  ),
  relevantSkills: z.array(z.string()).describe("List of technical skills matching the JD."),
});

export async function POST(req: Request) {
  try {
    const payload = await authenticate(req);
    const { jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    // 1. Drizzle Optimization: Fetch only relations, exclude heavy base user columns (passwords, dates)
    const rawUserData = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, payload.userId as string),
      columns: { id: true }, // We only need the ID from the root table
      with: { 
        profile: true, 
        experiences: true, 
        educations: true, 
        skills: true 
      },
    });

    if (!rawUserData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    // 2. Token Optimization: Convert JSON into dense, flat Markdown text
    let optimizedDataString = `USER PROFILE:\n`;
    
    if (rawUserData.profile) {
      optimizedDataString += `Name: ${rawUserData.profile.firstName || ""} ${rawUserData.profile.lastName || ""}\n`;
    }

    if (rawUserData.experiences && rawUserData.experiences.length > 0) {
      optimizedDataString += `\nEXPERIENCE:\n`;
      rawUserData.experiences.forEach(exp => {
        // Flattens bullets into a single line to save tokens on line breaks/array brackets
        const desc = (exp as any).descriptionBullets;
        const bullets =
          Array.isArray(desc) ? desc.join(" ") :
          typeof desc === "string" ? desc :
          "";
        optimizedDataString += `- ${exp.title} at ${exp.company}: ${bullets}\n`;
      });
    }

    if (rawUserData.educations && rawUserData.educations.length > 0) {
      optimizedDataString += `\nEDUCATION:\n`;
      rawUserData.educations.forEach(edu => {
        optimizedDataString += `- ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution}\n`;
      });
    }

    if (rawUserData.skills && rawUserData.skills.length > 0) {
      // Flatten all skill items into a single comma-separated string
      const allSkills = rawUserData.skills.flatMap(skill => skill.items).filter(Boolean).join(", ");
      optimizedDataString += `\nSKILLS: ${allSkills}\n`;
    }

    const systemPrompt = `You are an expert ATS resume writer. Tailor the user's experience to the Job Description. Return valid JSON only.`;
    
    // 3. Truncate the Job Description to ~3000 characters (roughly 500-600 words)
    // This prevents massive copy-paste inputs from blowing up your token limit
    const safeJobDescription = jobDescription.substring(0, 3000);

    const userPrompt = `${optimizedDataString}\n\nJOB DESCRIPTION:\n${safeJobDescription}`;

    console.log("🤖 Attempting generation with optimized token payload...");
    
    const response = await generateText({
      model: google("gemini-2.0-flash"),
      output: Output.object({ schema: resumeSchema }),
      system: systemPrompt,
      prompt: userPrompt,
    });

    console.log("✅ Successfully generated with Gemini");

    return NextResponse.json({ success: true, resume: response.output }, { status: 200 });

  } catch (error) {
    console.error("🔥 CRITICAL GENERATION ERROR:", error);
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
  }
}