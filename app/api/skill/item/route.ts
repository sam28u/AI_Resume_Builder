import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { authenticate } from "@/lib/auth/authenticate";
import { eq, and } from "drizzle-orm";

const skillItemSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  proficiency: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

// POST NEW ITEM TO EXISTING CATEGORY
export async function POST(req: Request) {
  try {
    const payload = await authenticate(req);
    const body = await req.json();

    const parsedData = z
      .object({
        skillId: z.string().uuid("Invalid skill ID"),
        item: skillItemSchema,
      })
      .parse(body);

    // fetch the existing skill first
    const existingSkill = await db
      .select()
      .from(skills)
      .where(
        and(
          eq(skills.id, parsedData.skillId),
          eq(skills.userId, payload?.userId as string)
        )
      )
      .limit(1);

    if (existingSkill.length === 0) {
      return NextResponse.json(
        { error: "Skill category not found" },
        { status: 404 }
      );
    }

    const currentItems = existingSkill[0].items as {
      name: string;
      proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
      yearsOfExperience?: number;
    }[];

    const alreadyExists = currentItems.some(
      (i) => i.name.toLowerCase() === parsedData.item.name.toLowerCase()
    );

    if (alreadyExists) {
      return NextResponse.json(
        { error: "Item already exists in this category" },
        { status: 409 }
      );
    }

    const updatedItems = [...currentItems, parsedData.item];

    const updatedSkill = await db
      .update(skills)
      .set({ items: updatedItems })
      .where(
        and(
          eq(skills.id, parsedData.skillId),
          eq(skills.userId, payload?.userId as string)
        )
      )
      .returning();

    return NextResponse.json(updatedSkill[0], { status: 200 });
  } catch (error) {
    console.error("POST Skill Item Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add skill item" },
      { status: 500 }
    );
  }
}

// DELETE AN ITEM FROM A CATEGORY
export async function DELETE(req: Request) {
  try {
    const payload = await authenticate(req);
    const { searchParams } = new URL(req.url);

    const skillId = searchParams.get("skillId");
    const itemName = searchParams.get("itemName");

    if (!skillId || !itemName) {
      return NextResponse.json(
        { error: "skillId and itemName are required" },
        { status: 400 }
      );
    }

    const existingSkill = await db
      .select()
      .from(skills)
      .where(
        and(
          eq(skills.id, skillId),
          eq(skills.userId, payload?.userId as string)
        )
      )
      .limit(1);

    if (existingSkill.length === 0) {
      return NextResponse.json(
        { error: "Skill category not found" },
        { status: 404 }
      );
    }

    const currentItems = existingSkill[0].items as {
      name: string;
      proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
      yearsOfExperience?: number;
    }[];

    const itemExists = currentItems.some(
      (i) => i.name.toLowerCase() === itemName.toLowerCase()
    );

    if (!itemExists) {
      return NextResponse.json(
        { error: "Item not found in this category" },
        { status: 404 }
      );
    }

    const updatedItems = currentItems.filter(
      (i) => i.name.toLowerCase() !== itemName.toLowerCase()
    );

    const updatedSkill = await db
      .update(skills)
      .set({ items: updatedItems })
      .where(
        and(
          eq(skills.id, skillId),
          eq(skills.userId, payload?.userId as string)
        )
      )
      .returning();

    return NextResponse.json(updatedSkill[0], { status: 200 });
  } catch (error) {
    console.error("DELETE Skill Item Error:", error);
    return NextResponse.json(
      { error: "Failed to delete skill item" },
      { status: 500 }
    );
  }
}