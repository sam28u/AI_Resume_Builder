import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { authenticate } from "@/lib/auth/authenticate";
import { eq, and } from "drizzle-orm";

// VALIDATION SCHEMA
const skillItemSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  proficiency: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

const skillSchema = z.object({
  category: z.string().min(1, "Category is required"),
  items: z.array(skillItemSchema).min(1, "At least one skill item is required"),
});

const updateSkillSchema = z.object({
  skillId: z.string().uuid("Invalid skill ID"),
  category: z.string().min(1).optional(),
  items: z.array(skillItemSchema).min(1).optional(),
});

// GET SKILLS
export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);

    const userSkills = await db
      .select()
      .from(skills)
      .where(eq(skills.userId, payload?.userId as string));

    return NextResponse.json(userSkills, { status: 200 });
  } catch (error) {
    console.error("GET Skills Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 },
    );
  }
}

// POST SKILLS
export async function POST(req: Request) {
  try {
    const payload = await authenticate(req);
    const body = await req.json();
    const parsedData = skillSchema.parse(body);

    // 1. Check if a category with this name already exists for this user
    const existingSkill = await db
      .select()
      .from(skills)
      .where(
        and(
          eq(skills.userId, payload?.userId as string),
          eq(skills.category, parsedData.category),
        ),
      )
      .limit(1);

    if (existingSkill.length > 0) {
      // 2. If it exists, append the new items to the existing ones
      const updatedItems = [...existingSkill[0].items, ...parsedData.items];

      const updated = await db
        .update(skills)
        .set({ items: updatedItems })
        .where(eq(skills.id, existingSkill[0].id))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    }

    // 3. Otherwise, create the new category as usual
    const newSkill = await db
      .insert(skills)
      .values({
        userId: payload?.userId as string,
        category: parsedData.category,
        items: parsedData.items,
      })
      .returning();

    return NextResponse.json(newSkill[0], { status: 201 });
  } catch (error) {
    console.error("POST Skills Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to add skills" },
      { status: 500 },
    );
  }
}

// UPDATE SKILLS
export async function PATCH(req: Request) {
  try {
    const payload = await authenticate(req);
    const body = await req.json();
    const parsedData = updateSkillSchema.parse(body);

    const updateData: {
      category?: string;
      items?: {
        name: string;
        proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
        yearsOfExperience?: number;
      }[];
    } = {};

    if (parsedData.category !== undefined)
      updateData.category = parsedData.category;

    if (parsedData.items !== undefined) updateData.items = parsedData.items;

    const updatedSkill = await db
      .update(skills)
      .set(updateData)
      .where(
        and(
          eq(skills.id, parsedData.skillId),
          eq(skills.userId, payload?.userId as string), // ensures user owns the skill
        ),
      )
      .returning();

    if (updatedSkill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSkill[0], { status: 200 });
  } catch (error) {
    console.error("PATCH Skills Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update skills" },
      { status: 500 },
    );
  }
}

// DELETE SKILLS
export async function DELETE(req: Request) {
  try {
    const payload = await authenticate(req);
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");

    if (!skillId) {
      return NextResponse.json(
        { error: "skillId is required" },
        { status: 400 },
      );
    }

    const deletedSkill = await db
      .delete(skills)
      .where(
        and(
          eq(skills.id, skillId),
          eq(skills.userId, payload?.userId as string), // ensures user owns the skill
        ),
      )
      .returning();

    if (deletedSkill.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Skill deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE Skills Error:", error);
    return NextResponse.json(
      { error: "Failed to delete skills" },
      { status: 500 },
    );
  }
}
