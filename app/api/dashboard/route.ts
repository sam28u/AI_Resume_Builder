import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate";
import {
  resumes,
  experiences,
  educations,
  projects,
  skills,
} from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = payload.userId as string;

    const [
      resumeCount,
      expCount,
      eduCount,
      projCount,
      skillCount,
      recentResumes,
    ] = await Promise.all([
      db
        .select({ value: count() })
        .from(resumes)
        .where(eq(resumes.userId, userId)),
      db
        .select({ value: count() })
        .from(experiences)
        .where(eq(experiences.userId, userId)),
      db
        .select({ value: count() })
        .from(educations)
        .where(eq(educations.userId, userId)),
      db
        .select({ value: count() })
        .from(projects)
        .where(eq(projects.userId, userId)),
      db
        .select({ value: count() })
        .from(skills)
        .where(eq(skills.userId, userId)),
      db.query.resumes.findMany({
        where: eq(resumes.userId, userId),
        orderBy: [desc(resumes.createdAt)],
        limit: 5,
      }),
    ]);

    const totalDataEntries =
      expCount[0].value + eduCount[0].value + projCount[0].value;

    return NextResponse.json({
      stats: {
        resumesGenerated: resumeCount[0].value,
        dataEntries: totalDataEntries,
        totalSkills: skillCount[0].value, // New Metric
      },
      recentActivity: recentResumes,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
