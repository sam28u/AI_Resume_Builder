import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { authenticate } from "@/lib/auth/authenticate";

export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = payload;
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.userId as string;
    const userResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId));
    return NextResponse.json(userResumes);
  } catch (error: any) {
    console.error("GET Resumes Error:", error); // <-- Add this line
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, // <-- Send details to the frontend
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { jobDescription, generatedContent } = body;

    if (!jobDescription || !generatedContent) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    // Force the types here
    const [newResume] = await db
      .insert(resumes)
      .values({
        userId: user.userId as string,
        jobDescription: jobDescription as string,
        generatedContent: generatedContent as any,
      })
      .returning();
    return NextResponse.json(newResume, { status: 201 });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message, // <--- This will expose the exact DB error
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
