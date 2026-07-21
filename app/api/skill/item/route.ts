import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { skills } from "@/lib/db/schema";
import { authenticate } from "@/lib/auth/authenticate";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: Request) {
  try {
    const payload = await authenticate(req);
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");
    const itemName = searchParams.get("itemName");

    if (!skillId || !itemName) {
      return NextResponse.json({ error: "Missing skillId or itemName" }, { status: 400 });
    }

    // 1. Find the skill category row
    const [existingSkill] = await db
      .select()
      .from(skills)
      .where(
        and(
          eq(skills.id, skillId),
          eq(skills.userId, payload?.userId as string)
        )
      );

    if (!existingSkill) {
      return NextResponse.json({ error: "Skill category not found" }, { status: 404 });
    }

    // 2. Filter out the specific skill item from the JSONB items array
    const updatedItems = (existingSkill.items as any[]).filter(
      (item) => item.name !== itemName
    );

    // 3. If the items array becomes empty, delete the category entirely, or update it
    if (updatedItems.length === 0) {
      await db.delete(skills).where(eq(skills.id, skillId));
      return NextResponse.json({ message: "Skill item and empty category deleted successfully" }, { status: 200 });
    }

    // Otherwise, update the row with the remaining items
    const updated = await db
      .update(skills)
      .set({ items: updatedItems })
      .where(eq(skills.id, skillId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("DELETE Skill Item Error:", error);
    return NextResponse.json({ error: "Failed to delete skill item" }, { status: 500 });
  }
}