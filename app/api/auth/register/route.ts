import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.transaction(async (tx) => {
      
      const [newUser] = await tx.insert(users).values({
        email,
        passwordHash: passwordHash,
        role: "user",
      }).returning({ id: users.id, email: users.email, role: users.role }); 

      await tx.insert(profiles).values({
        userId: newUser.id,
        firstName,
        lastName,
      });

      return { newUser };
    });

    return NextResponse.json({ 
      message: "Account created successfully",
      user: result.newUser 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}