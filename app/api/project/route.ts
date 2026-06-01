import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { authenticate } from "@/lib/auth/authenticate";
import { eq, and } from "drizzle-orm";

// VALIDATION SCHEMAS
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  link: z.string().url("Invalid URL").optional(),
  githubLink: z.string().url("Invalid GitHub URL").optional(),
});

const updateProjectSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  technologies: z.array(z.string()).min(1).optional(),
  link: z.string().url("Invalid URL").optional().nullable(),
  githubLink: z.string().url("Invalid GitHub URL").optional().nullable(),
});

// GET ALL PROJECTS
export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, payload.userId as string));

    return NextResponse.json(userProjects, { status: 200 });
  } catch (error) {
    console.error("GET Projects Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// CREATE PROJECT
export async function POST(req: Request) {
  try {
    const payload = await authenticate(req);
    const body = await req.json();
    const parsedData = createProjectSchema.parse(body);

    const newProject = await db
      .insert(projects)
      .values({
        userId: payload.userId as string,
        name: parsedData.name,
        description: parsedData.description,
        technologies: parsedData.technologies,
        link: parsedData.link ?? null,
        githubLink: parsedData.githubLink ?? null,
      })
      .returning();

    return NextResponse.json(newProject[0], { status: 201 });
  } catch (error) {
    console.error("POST Projects Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// UPDATE PROJECT
export async function PATCH(req: Request) {
  try {
    const payload = await authenticate(req);
    const body = await req.json();
    const parsedData = updateProjectSchema.parse(body);

    const updateData: {
      name?: string;
      description?: string;
      technologies?: string[];
      link?: string | null;
      githubLink?: string | null;
    } = {};

    if (parsedData.name !== undefined) updateData.name = parsedData.name;
    if (parsedData.description !== undefined) updateData.description = parsedData.description;
    if (parsedData.technologies !== undefined) updateData.technologies = parsedData.technologies;
    if (parsedData.link !== undefined) updateData.link = parsedData.link;
    if (parsedData.githubLink !== undefined) updateData.githubLink = parsedData.githubLink;

    const updatedProject = await db
      .update(projects)
      .set(updateData)
      .where(
        and(
          eq(projects.id, parsedData.projectId),
          eq(projects.userId, payload.userId as string)
        )
      )
      .returning();

    if (updatedProject.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProject[0], { status: 200 });
  } catch (error) {
    console.error("PATCH Projects Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE PROJECT
export async function DELETE(req: Request) {
  try {
    const payload = await authenticate(req);
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const deletedProject = await db
      .delete(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.userId, payload.userId as string)
        )
      )
      .returning();

    if (deletedProject.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Projects Error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}