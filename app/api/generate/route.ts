import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";
import { generateText } from "ai"; 
import { z } from "zod";
import { createGroq } from "@ai-sdk/groq";

const resumeSchema = z.object({
  professionalSummary: z.string(),
  tailoredExperiences: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      optimizedBullets: z.array(z.string()),
    }),
  ),
  relevantSkills: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const payload = await authenticate(req);
    
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON format. Make sure multi-line strings are properly escaped with \\n." },
        { status: 400 }
      );
    }

    const { jobDescription } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    const rawUserData = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, payload.userId as string),
      columns: { id: true },
      with: {
        profile: true,
        experiences: true,
        educations: true,
        skills: true,
      },
    });

    if (!rawUserData) {
      return NextResponse.json(
        { error: "User data not found" },
        { status: 404 },
      );
    }

    let optimizedDataString = `USER PROFILE:\n`;

    if (rawUserData.profile) {
      const { firstName, lastName } = rawUserData.profile;
      const headline = (rawUserData.profile as any).headline;
      const bio = (rawUserData.profile as any).bio;
      optimizedDataString += `Name: ${firstName || ""} ${lastName || ""}\n`;
      if (headline) optimizedDataString += `Headline: ${headline}\n`;
      if (bio) optimizedDataString += `Bio/Summary: ${bio}\n`;
      optimizedDataString += `\n`;
    }

    if (rawUserData.experiences && rawUserData.experiences.length > 0) {
      optimizedDataString += `WORK EXPERIENCE:\n`;
      rawUserData.experiences.forEach((exp: any) => {
        optimizedDataString += `- Role: ${exp.title} at ${exp.company}\n`;
        optimizedDataString += `  Duration: ${exp.startDate || "Unknown"} to ${exp.endDate || "Present"}\n`;
        if (exp.description) {
          optimizedDataString += `  Details: ${exp.description}\n`;
        }
      });
      optimizedDataString += `\n`;
    }

    if (rawUserData.educations && rawUserData.educations.length > 0) {
      optimizedDataString += `EDUCATION:\n`;
      rawUserData.educations.forEach((edu: any) => {
        optimizedDataString += `- Degree: ${edu.degree} at ${edu.school}\n`;
        if (edu.fieldOfStudy) {
          optimizedDataString += `  Field of Study: ${edu.fieldOfStudy}\n`;
        }
        optimizedDataString += `  Duration: ${edu.startDate || "Unknown"} to ${edu.endDate || "Present"}\n`;
      });
      optimizedDataString += `\n`;
    }

    if (rawUserData.skills && rawUserData.skills.length > 0) {
      const skillNames = rawUserData.skills
        .map((skill: any) => skill.name || skill)
        .join(", ");

      optimizedDataString += `SKILLS:\n${skillNames}\n`;
    }
    
    const safeJobDescription = jobDescription.substring(0, 3000);
    const userPrompt = `${optimizedDataString}\n\nJOB DESCRIPTION:\n${safeJobDescription}`;

    const systemPrompt = `You are an expert ATS resume writer. Tailor the user's experience to the Job Description. 
You MUST return ONLY raw, valid JSON matching this exact structure. Do not wrap it in markdown blocks or add any conversational text:
{
  "professionalSummary": "A strong, ATS-friendly summary paragraph.",
  "tailoredExperiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "optimizedBullets": ["Action-oriented bullet 1", "Action-oriented bullet 2"]
    }
  ],
  "relevantSkills": ["Skill 1", "Skill 2"]
}`;

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    console.log("🤖 Attempting generation with Groq...");

    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    console.log("✅ Successfully generated text with Groq");

    const rawJsonString = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedResume = JSON.parse(rawJsonString);

    return NextResponse.json(
      { success: true, resume: parsedResume },
      { status: 200 },
    );
  } catch (error) {
    console.error("🔥 CRITICAL GENERATION ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 },
    );
  }
}