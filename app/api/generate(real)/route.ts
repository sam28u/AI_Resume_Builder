import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";
// Import generateText and Output from the Vercel AI SDK
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Define the schema for the output
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

    // Fetch user data including relations
    const rawUserData = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, payload.userId as string),
      with: { profile: true, experiences: true, educations: true, skills: true },
    });

    if (!rawUserData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    // NEW: Clean the data to save tokens!
    const cleanUserData = {
      profile: {
        firstName: rawUserData.profile?.firstName,
        lastName: rawUserData.profile?.lastName,
        // Don't send URLs unless the LLM needs them for contact info
      },
      experiences: rawUserData.experiences.map(exp => ({
        company: exp.company,
        title: exp.title,
        descriptionBullets: exp.descriptionBullets,
      })),
      educations: rawUserData.educations.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
      })),
      skills: rawUserData.skills.map(skill => skill.items),
    };

    const systemPrompt = `You are an expert ATS resume writer. Tailor the experience to the Job Description. Return valid JSON only.`;
    
    // Stringify the CLEAN data, not the raw Drizzle output
    const userPrompt = `USER DATA: ${JSON.stringify(cleanUserData, null, 2)}\n\nJOB DESCRIPTION: ${jobDescription}`;

    console.log("🤖 Attempting generation with Gemini 2.0 Flash...");
    
    // Call generateText with the output schema defined
    const response = await generateText({
      model: google("gemini-2.0-flash"),
      // Wrap the Zod schema in Output.object()
      output: Output.object({ schema: resumeSchema }),
      system: systemPrompt,
      prompt: userPrompt,
    });

    console.log("✅ Successfully generated with Gemini");

    // Extract the typed object from the response.output property
    return NextResponse.json({ success: true, resume: response.output }, { status: 200 });

  } catch (error) {
    console.error("🔥 CRITICAL GENERATION ERROR:", error);
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
  }
}