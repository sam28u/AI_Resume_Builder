import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth/authenticate"; // Adjust path if your auth helper is located elsewhere
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request) {
  try {
    // 1. Authenticate the user
    const payload = await authenticate(req);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = payload.userId as string;

    // 2. Parse the request body
    const body = await req.json();
    const { firstName, lastName, githubUrl, linkedinUrl, portfolioUrl } = body;

    // 3. Check if the user already has a profile
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    let savedProfile;

    if (existingProfile) {
      // UPDATE existing profile
      const [updated] = await db
        .update(profiles)
        .set({
          firstName,
          lastName,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
        })
        .where(eq(profiles.userId, userId))
        .returning();
        
      savedProfile = updated;
    } else {
      // CREATE new profile
      const [inserted] = await db
        .insert(profiles)
        .values({
          userId,
          firstName,
          lastName,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
        })
        .returning();
        
      savedProfile = inserted;
    }

    // 4. Return the saved data
    return NextResponse.json(savedProfile);
    
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}