import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles, refreshTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    // 1. Basic Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Check if the user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    // 3. Hash the password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Execute a Database Transaction
    // If any step inside this block throws an error, Drizzle will automatically rollback the entire transaction.
    const result = await db.transaction(async (tx) => {
      
      // Step A: Create the base user
      const [newUser] = await tx.insert(users).values({
        email,
        passwordHash: passwordHash,
        role: "user",
      }).returning({ id: users.id, email: users.email, role: users.role }); // We need the new ID for the next steps

      // Step B: Create the linked profile
      await tx.insert(profiles).values({
        userId: newUser.id,
        firstName,
        lastName,
      });

      // Step C: Generate tokens (log them in immediately for better UX)
      const tokenId = randomUUID();
      const accessToken = await signAccessToken({ userId: newUser.id, role: newUser.role });
      const refreshToken = await signRefreshToken({ jti: tokenId, userId: newUser.id });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      // Step D: Save the refresh token session
      await tx.insert(refreshTokens).values({
        userId: newUser.id,
        token: tokenId,
        expiresAt,
      });

      // Pass the necessary data out of the transaction block
      return { newUser, accessToken, refreshToken };
    });

    // 5. Prepare the response and set the secure cookie
    const response = NextResponse.json({ 
      accessToken: result.accessToken, 
      user: result.newUser 
    }, { status: 201 }); // 201 Created

    response.cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}