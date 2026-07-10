import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { experiences } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/auth/authenticate";
import { z } from "zod";

// EXPERIENCE VALIDATION SCHEMA
const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),

  title: z.string().min(1, "Title is required"),

  startDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    {
      message: "Invalid start date format",
    }
  ),

  endDate: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)),
      {
        message: "Invalid end date format",
      }
    )
    .optional(),

  descriptionBullets: z
    .array(z.string().min(1))
    .default([]),
});

// GET ALL EXPERIENCES
export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);

    const userExperiences = await db
      .select()
      .from(experiences)
      .where(
        eq(
          experiences.userId,
          payload?.userId as string
        )
      );

    return NextResponse.json(
      userExperiences,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET Experience Error:",
      error
    );

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

// CREATE EXPERIENCE
export async function POST(req: Request) {
  try {
    const payload = await authenticate(req);

    const body = await req.json();

    const parsedData =
      experienceSchema.parse(body);

    const newExperience = await db
      .insert(experiences)
      .values({
        userId: payload?.userId as string,

        company: parsedData.company,

        title: parsedData.title,

        startDate: new Date(
          parsedData.startDate
        ),

        endDate: parsedData.endDate
          ? new Date(parsedData.endDate)
          : null,

        descriptionBullets:
          parsedData.descriptionBullets,
      })
      .returning();

    return NextResponse.json(
      newExperience[0],
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST Experience Error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to create experience",
      },
      { status: 500 }
    );
  }
}

// UPDATE EXPERIENCE
export async function PATCH(req: Request) {
  try {
    const payload = await authenticate(req);

    const body = await req.json();

    // PATCH VALIDATION SCHEMA
    const updateExperienceSchema =
      experienceSchema
        .partial()
        .extend({
          id: z
            .string()
            .min(1, "ID is required"),
        });

    const parsedData =
      updateExperienceSchema.parse(body);

    const { id, ...rest } =
      parsedData;

    // SAFE UPDATE OBJECT
    const updateData: {
      company?: string;
      title?: string;
      startDate?: Date;
      endDate?: Date | null;
      descriptionBullets?: string[];
    } = {};

    if (rest.company !== undefined) {
      updateData.company =
        rest.company;
    }

    if (rest.title !== undefined) {
      updateData.title = rest.title;
    }

    if (rest.startDate !== undefined) {
      updateData.startDate =
        new Date(rest.startDate);
    }

    if (rest.endDate !== undefined) {
      updateData.endDate = rest.endDate
        ? new Date(rest.endDate)
        : null;
    }

    if (
      rest.descriptionBullets !== undefined
    ) {
      updateData.descriptionBullets =
        rest.descriptionBullets;
    }

    const updatedExperience = await db
      .update(experiences)
      .set(updateData)
      .where(
        and(
          eq(experiences.id, id),

          eq(
            experiences.userId,
            payload?.userId as string
          )
        )
      )
      .returning();

    if (updatedExperience.length === 0) {
      return NextResponse.json(
        {
          error:
            "Experience not found or unauthorized",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      updatedExperience[0],
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH Experience Error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to update experience",
      },
      { status: 500 }
    );
  }
}

// DELETE EXPERIENCE
export async function DELETE(req: Request) {
  try {
    const payload = await authenticate(req);

    const body = await req.json();

    const deleteSchema = z.object({
      id: z.string().min(1),
    });

    const parsedData =
      deleteSchema.parse(body);

    const deletedExperience = await db
      .delete(experiences)
      .where(
        and(
          eq(
            experiences.id,
            parsedData.id
          ),

          eq(
            experiences.userId,
            payload?.userId as string
          )
        )
      )
      .returning();

    if (deletedExperience.length === 0) {
      return NextResponse.json(
        {
          error:
            "Experience not found or unauthorized",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Experience deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "DELETE Experience Error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to delete experience",
      },
      { status: 500 }
    );
  }
}