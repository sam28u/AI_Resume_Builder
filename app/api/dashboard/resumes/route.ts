import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";
import { resumes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResumes = await db.query.resumes.findMany({
      where: eq(resumes.userId, payload.userId as string),
      orderBy: [desc(resumes.createdAt)],
    });

    return NextResponse.json(userResumes);
  } catch (error) {
    console.error("Resumes GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await authenticate(req);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobDescription, generatedContent } = body;

    const [newResume] = await db.insert(resumes).values({
      userId: payload.userId as string,
      jobDescription,
      generatedContent,
    }).returning();

    return NextResponse.json(newResume);
  } catch (error) {
    console.error("Resumes POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}