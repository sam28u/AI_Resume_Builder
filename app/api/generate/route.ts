import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";
import { generateText } from "ai";
import { z } from "zod";
import { createGroq } from "@ai-sdk/groq";
import * as typst from "typst";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { randomUUID } from "crypto";

// Optional: Zod schema for reference (useful if you switch to generateObject later)
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

// --- HELPER FUNCTION: Compile the JSON to PDF ---
async function generateTypstPdf(
  profile: any,
  resumeData: any,
): Promise<Buffer> {
  const reqId = randomUUID();
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `${reqId}.typ`);
  const outputPath = path.join(tempDir, `${reqId}.pdf`);

  // Build the Typst markup dynamically using the AI's output
  let typstContent = `
#set page(paper: "us-letter", margin: 1in)
#set text(font: "Linux Libertine", size: 11pt)
#set par(justify: true)

#align(center)[
  #text(size: 20pt, weight: "bold")[${profile?.firstName || ""} ${profile?.lastName || ""}]
]
#line(length: 100%, stroke: 0.5pt)
#v(5pt)

== Professional Summary
${resumeData.professionalSummary}
#v(10pt)

== Skills
${resumeData.relevantSkills.join(" • ")}
#v(10pt)

== Professional Experience
  `;

  // Append Experiences dynamically
  resumeData.tailoredExperiences.forEach((exp: any) => {
    typstContent += `\n*${exp.title}* | ${exp.company}\n`;
    exp.optimizedBullets.forEach((bullet: string) => {
      // Escape any accidental quotation marks in bullets that might break compilation
      const cleanBullet = bullet.replace(/"/g, "'");
      typstContent += `- ${cleanBullet}\n`;
    });
    typstContent += `#v(5pt)\n`;
  });

  try {
    await fs.writeFile(inputPath, typstContent, "utf-8");
    await typst.compile(inputPath, outputPath);
    const pdfBuffer = await fs.readFile(outputPath);
    return pdfBuffer;
  } catch (error) {
    console.error("Typst compilation failed:", error);
    throw new Error("Failed to compile PDF");
  } finally {
    // Always clean up temp files to prevent disk overflow
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
  }
}

// --- MAIN API ROUTE ---
export async function POST(req: Request) {
  try {
    // 1. Authenticate & Parse Request
    const payload = await authenticate(req);

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error:
            "Invalid JSON format. Make sure multi-line strings are properly escaped with \\n.",
        },
        { status: 400 },
      );
    }

    const { jobDescription } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    // 2. Fetch User Data
    const rawUserData = await db.query.users.findFirst({
      where: (users: any, { eq }: any) =>
        eq(users.id, payload.userId as string),
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

    // 3. Format Database Data for the LLM
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

    // 4. Prompt the LLM
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

    // 5. Parse LLM JSON Output
    const rawJsonString = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedResume = JSON.parse(rawJsonString);

    // 6. Generate PDF Buffer via Typst
    console.log("📄 Compiling Typst PDF...");
    const pdfBuffer = await generateTypstPdf(rawUserData.profile, parsedResume);
    console.log("✅ Successfully compiled PDF");

    // Wrap the Node Buffer in a standard Uint8Array to satisfy the Blob type constraints
    const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], {
      type: "application/pdf",
    });

    // 7. Return the file stream to the client
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="tailored-resume.pdf"',
      },
    });
  } catch (error) {
    console.error("🔥 CRITICAL GENERATION ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 },
    );
  }
}
