import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";

// I've commented these out so you don't get "unused variable" warnings today, 
// but you can easily uncomment them tomorrow when your quota resets.
// import { generateText, Output } from "ai";
// import { google } from "@ai-sdk/google";
// import { z } from "zod";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the incoming request
    const payload = await authenticate(req);
    
    // 2. Parse the job description from Postman / the frontend
    const { jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    // 3. Verify the database connection and fetch the user
    const rawUserData = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, payload.userId as string),
      with: { profile: true, experiences: true, educations: true, skills: true },
    });

    if (!rawUserData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    console.log("⚠️ Bypassing Google API (Daily Limit Hit) -> Serving Mock Data");
    
    // 4. Simulate a 2-second API delay so you can build frontend loading spinners
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 5. Perfect mock data matching the exact schema you defined earlier
    const mockResume = {
      professionalSummary: "Results-oriented Full Stack Software Engineer with expertise in Next.js, React, and PostgreSQL. Proven ability to architect custom solutions from scratch, optimize complex database queries with Drizzle ORM, and build highly performant, low-bandwidth applications.",
      tailoredExperiences: [
        {
          company: "IIIT Bhubaneswar Projects",
          title: "Full Stack Developer (Next.js & Node.js)",
          optimizedBullets: [
            "Architected and developed IMS.proc, a high-performance inventory tracking application using Next.js and PostgreSQL.",
            "Built Gram Vani from scratch, designing context-aware systems optimized for low-bandwidth environments without relying on pre-built managed services.",
            "Designed complex database relations using Drizzle ORM, ensuring fast and scalable data retrieval."
          ]
        }
      ],
      relevantSkills: [
        "Next.js (App Router)",
        "TypeScript",
        "React",
        "PostgreSQL",
        "Drizzle ORM",
        "Node.js/Fastify",
        "Linux System Architecture"
      ]
    };

    console.log("✅ Successfully served mock resume");
    
    // 6. Return the response exactly as the real AI route would
    return NextResponse.json({ success: true, resume: mockResume }, { status: 200 });

  } catch (error) {
    console.error("🔥 CRITICAL GENERATION ERROR:", error);
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
  }
}