import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";

export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await db.query.users.findFirst({
      where: (users: any, { eq }: any) => eq(users.id, payload.userId as string),
      columns: { id: true },
      with: {
        profile: true,
        experiences: true,
        educations: true,
        projects: true,
        skills: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: userData.profile || null,
      experiences: userData.experiences || [],
      educations: userData.educations || [],
      projects: userData.projects || [],
      skills: userData.skills || [],
    });
  } catch (error) {
    console.error("Me API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}