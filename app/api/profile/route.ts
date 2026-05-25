import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/jwt"; // Import your auth helper

export async function GET(req: Request) {
  try {
    // 1. Extract the Access Token from the Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // 2. Verify the token cryptographically
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Query the database using the legitimate UUID from the token
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, payload.userId as string))
      .limit(1);

    // If no profile is found, return an empty object or null instead of an error
    return NextResponse.json(userProfile[0] || null);

  } catch (error) {
    // 🚨 Always log the actual error to your terminal so you can see what broke
    console.error("❌ Profile Route Error:", error); 
    
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}