import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid token" },
      { status: 401 },
    );
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userExperiences = await db
      .select()
      .from(experiences)
      .where(eq(experiences.userId, payload.userId as string));

    return NextResponse.json(userExperiences);
  } catch (error) {
    console.error("❌ Experience Route Error:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid token" },
      { status: 401 },
    );
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company, title, startDate, endDate, descriptionBullets } =
      await req.json();

    const newExperience = await db
      .insert(experiences)
      .values({
        userId: payload.userId as string,
        company,
        title,
        startDate,
        endDate,
        descriptionBullets,
      })
      .returning();

    return NextResponse.json(newExperience[0]);
  } catch (error) {
    console.error("❌ Experience Route Error:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid token" },
      { status: 401 },
    );
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, company, title, startDate, endDate, descriptionBullets } =
      await req.json();

    const updatedExperience = await db
      .update(experiences)
      .set({ company, title, startDate, endDate, descriptionBullets })
      .where(
        and(
          eq(experiences.id, id),
          eq(experiences.userId, payload.userId as string),
        ),
      )
      .returning();

    if (updatedExperience.length === 0) {
      return NextResponse.json(
        { error: "Experience not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedExperience[0]);
  } catch (error) {
    console.error("❌ Experience Route Error:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid token" },
      { status: 401 },
    );
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    const deletedExperience = await db
      .delete(experiences)
      .where(
        and(
          eq(experiences.id, id),
          eq(experiences.userId, payload.userId as string),
        ),
      )
      .returning();

    if (deletedExperience.length === 0) {
      return NextResponse.json(
        { error: "Experience not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("❌ Experience Route Error:", error);
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 },
    );
  }
}
