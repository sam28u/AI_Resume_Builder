import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/auth/authenticate";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, payload.userId as string));
      
    return NextResponse.json(userResumes);
  } catch (error: any) {
    console.error("GET Resumes Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("id");

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
    }

    const deletedResume = await db
      .delete(resumes)
      .where(
        and(
          eq(resumes.id, resumeId),
          eq(resumes.userId, user.userId as string)
        )
      )
      .returning();

    if (deletedResume.length === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Resume deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { jobDescription } = body;

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    // 1. Fetch User Data
    const rawUserData = await db.query.users.findFirst({
      where: (users: any, { eq }: any) => eq(users.id, user.userId as string),
      columns: { id: true },
      with: {
        profile: true,
        experiences: true,
        educations: true,
        skills: true,
      },
    });

    if (!rawUserData) return NextResponse.json({ error: "User data not found" }, { status: 404 });

    // 2. Format Database Data for the LLM
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
        if (exp.description) optimizedDataString += `  Details: ${exp.description}\n`;
      });
      optimizedDataString += `\n`;
    }

    if (rawUserData.educations && rawUserData.educations.length > 0) {
      optimizedDataString += `EDUCATION:\n`;
      rawUserData.educations.forEach((edu: any) => {
        optimizedDataString += `- Degree: ${edu.degree} at ${edu.institution || edu.school}\n`;
        if (edu.fieldOfStudy) optimizedDataString += `  Field of Study: ${edu.fieldOfStudy}\n`;
        optimizedDataString += `  Duration: ${edu.startDate || "Unknown"} to ${edu.endDate || "Present"}\n`;
      });
      optimizedDataString += `\n`;
    }

    if (rawUserData.skills && rawUserData.skills.length > 0) {
      const skillNames = rawUserData.skills.map((skill: any) => skill.category || skill.name || skill).join(", ");
      optimizedDataString += `SKILLS:\n${skillNames}\n`;
    }

    // 3. Prompt the LLM
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

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });
    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    // 4. Parse LLM JSON Output
    const rawJsonString = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedResume = JSON.parse(rawJsonString);

    // 5. Save generated AI output to Database
    const [newResume] = await db
      .insert(resumes)
      .values({
        userId: user.userId as string,
        jobDescription: jobDescription as string,
        generatedContent: parsedResume,
      })
      .returning();

    return NextResponse.json(newResume, { status: 201 });
  } catch (error: any) {
    console.error("AI Generation & DB save error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}