import { NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { users, refreshTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt"; // Use for real password checking

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Verify User (Mocked logic)
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user[0]) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare the raw password from the user with the hash in the database
    const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    // 2. Generate Tokens
    const tokenId = randomUUID(); // Unique ID for this refresh token
    const accessToken = await signAccessToken({ userId: user[0].id, role: user[0].role });
    const refreshToken = await signRefreshToken({ jti: tokenId, userId: user[0].id });

    // 3. Save Refresh Token in Database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await db.insert(refreshTokens).values({
      userId: user[0].id,
      token: tokenId, // Store the ID, not the whole JWT
      expiresAt: expiresAt,
    });

    // 4. Set Secure Cookie & Return Access Token
    const response = NextResponse.json({ accessToken, user: { id: user[0].id, email: user[0].email } });
    
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}