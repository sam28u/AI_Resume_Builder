import { NextResponse } from "next/server";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  // 1. Get token from cookies
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/refresh_token=([^;]+)/);
  const tokenStr = match ? match[1] : null;

  if (!tokenStr) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  // 2. Verify Cryptographic Signature
  const payload = await verifyToken(tokenStr);
  if (!payload || !payload.jti || !payload.userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = payload.userId as string;
  const tokenId = payload.jti as string;

  // 3. Verify in Database (Ensure it hasn't been revoked)
  const dbToken = await db.select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.token, tokenId), eq(refreshTokens.isRevoked, false)))
    .limit(1);

  if (!dbToken[0] || new Date(dbToken[0].expiresAt) < new Date()) {
    return NextResponse.json({ error: "Token revoked or expired" }, { status: 401 });
  }

  // 4. Rotate Tokens (Invalidate old, create new)
  await db.update(refreshTokens)
    .set({ isRevoked: true })
    .where(eq(refreshTokens.id, dbToken[0].id));

  const newTokenId = randomUUID();
  const newAccessToken = await signAccessToken({ userId, role: "user" });
  const newRefreshToken = await signRefreshToken({ jti: newTokenId, userId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(refreshTokens).values({
    userId,
    token: newTokenId,
    expiresAt,
  });

  // 5. Send Response with new tokens
  const response = NextResponse.json({ accessToken: newAccessToken });
  
  response.cookies.set("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}