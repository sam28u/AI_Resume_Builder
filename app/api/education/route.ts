import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { educations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/auth/authenticate";
import { z } from "zod";

const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().min(1),

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
});

// GET ALL EDUCATION ENTRIES
export async function GET(request: Request) {
  try {
    const payload = await authenticate(request);

    const educationEntries = await db
      .select()
      .from(educations)
      .where(
        eq(
          educations.userId,
          payload.userId as string
        )
      );

    return NextResponse.json(
      {
        education: educationEntries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ GET Education Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch education entries",
      },
      { status: 500 }
    );
  }
}

// CREATE EDUCATION ENTRY
export async function POST(request: Request) {
  try {
    const payload = await authenticate(request);

    const body = await request.json();

    const parsedData =
      educationSchema.parse(body);

    const newEducation = await db
      .insert(educations)
      .values({
        userId: payload.userId as string,

        institution:
          parsedData.institution,

        degree: parsedData.degree,

        fieldOfStudy:
          parsedData.fieldOfStudy,

        startDate: new Date(
          parsedData.startDate
        ),

        endDate: parsedData.endDate
          ? new Date(parsedData.endDate)
          : null,
      })
      .returning();

    return NextResponse.json(
      {
        education: newEducation[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "❌ POST Education Error:",
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
          "Failed to create education entry",
      },
      { status: 500 }
    );
  }
}

// UPDATE EDUCATION ENTRY
export async function PATCH(request: Request) {
  try {
    const payload = await authenticate(request);

    const body = await request.json();

    const updateSchema =
      educationSchema.partial().extend({
        id: z.string().min(1),
      });

    const parsedData =
      updateSchema.parse(body);

    const { id, ...rest } = parsedData;

    // Ensure startDate and endDate are Date or undefined
    const updateData: {
      institution?: string;
      degree?: string;
      fieldOfStudy?: string;
      startDate?: Date;
      endDate?: Date | null;
    } = {};

    if (rest.institution !== undefined) updateData.institution = rest.institution;
    if (rest.degree !== undefined) updateData.degree = rest.degree;
    if (rest.fieldOfStudy !== undefined) updateData.fieldOfStudy = rest.fieldOfStudy;
    if (rest.startDate !== undefined) updateData.startDate = rest.startDate ? new Date(rest.startDate) : undefined;
    if (rest.endDate !== undefined) updateData.endDate = rest.endDate ? new Date(rest.endDate) : null;

    const updatedEducation = await db
      .update(educations)
      .set(updateData)
      .where(
        and(
          eq(educations.id, id),

          eq(
            educations.userId,
            payload.userId as string
          )
        )
      )
      .returning();

    if (updatedEducation.length === 0) {
      return NextResponse.json(
        {
          error:
            "Education entry not found or unauthorized",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        education: updatedEducation[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ PATCH Education Error:",
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
          "Failed to update education entry",
      },
      { status: 500 }
    );
  }
}

// DELETE EDUCATION ENTRY
export async function DELETE(request: Request) {
  try {
    const payload = await authenticate(request);

    const { searchParams } = new URL(
      request.url
    );

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Education entry ID is required",
        },
        { status: 400 }
      );
    }

    const deletedEducation = await db
      .delete(educations)
      .where(
        and(
          eq(educations.id, id),

          eq(
            educations.userId,
            payload.userId as string
          )
        )
      )
      .returning();

    if (deletedEducation.length === 0) {
      return NextResponse.json(
        {
          error:
            "Education entry not found or unauthorized",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Education entry deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "❌ DELETE Education Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete education entry",
      },
      { status: 500 }
    );
  }
}