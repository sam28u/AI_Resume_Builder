import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/refresh_token=([^;]+)/);
    const tokenStr = match ? match[1] : null;

    if (tokenStr) {
      try {
        const payload = await verifyToken(tokenStr);
        if (payload && payload.jti) {
          const tokenId = payload.jti as string;
          await db.delete(refreshTokens).where(eq(refreshTokens.token, tokenId));
        }
      } catch (tokenError) {
        console.warn("Logout: Invalid token presented, proceeding to clear cookie.");
      }
    }

    const response = NextResponse.json(
      { message: "Logged out successfully" }, 
      { status: 200 }
    );

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, 
    });

    return response;

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}