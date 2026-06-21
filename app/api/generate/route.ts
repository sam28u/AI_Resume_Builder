import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";
import { generateText } from "ai"; // 👈 Switched back to generateText
import { z } from "zod";
import { createGroq } from "@ai-sdk/groq";

// You can keep the Zod schema for server-side validation if you want, 
// but we won't pass it directly to the AI SDK.
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
    const { jobDescription } = await req.json();

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
    // ... [Keep your existing flattening logic here] ...

    const safeJobDescription = jobDescription.substring(0, 3000);
    const userPrompt = `${optimizedDataString}\n\nJOB DESCRIPTION:\n${safeJobDescription}`;

    // 👈 1. Update the system prompt to explicitly define the expected JSON structure
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

    // 👈 2. Use generateText instead of generateObject
    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    console.log("✅ Successfully generated text with Groq");

    // 👈 3. Clean and parse the response
    // (This strips out any stray markdown formatting like ```json that the LLM might hallucinate)
    const rawJsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
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