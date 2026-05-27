import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "@/lib/auth/authenticate";
import { z } from "zod";

// VALIDATION SCHEMAS

const socialLinksSchema = z.object({
  githubUrl: z
    .string()
    .url("Invalid GitHub URL")
    .optional(),

  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional(),

  portfolioUrl: z
    .string()
    .url("Invalid Portfolio URL")
    .optional(),
});

const basicInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .optional(),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .optional(),
});

// GET PROFILE
export async function GET(req: Request) {
  try {
    const payload = await authenticate(req);

    const userProfile = await db
      .select()
      .from(profiles)
      .where(
        eq(
          profiles.userId,
          payload.userId as string
        )
      )
      .limit(1);

    return NextResponse.json(
      userProfile[0] || null,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET Profile Error:",
      error
    );

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

// UPDATE SOCIAL LINKS
export async function POST(req: Request) {
  try {
    const payload = await authenticate(req);

    const body = await req.json();

    const parsedData =
      socialLinksSchema.parse(body);

    const updateData: {
      githubUrl?: string;
      linkedinUrl?: string;
      portfolioUrl?: string;
    } = {};

    if (
      parsedData.githubUrl !== undefined
    ) {
      updateData.githubUrl =
        parsedData.githubUrl;
    }

    if (
      parsedData.linkedinUrl !== undefined
    ) {
      updateData.linkedinUrl =
        parsedData.linkedinUrl;
    }

    if (
      parsedData.portfolioUrl !== undefined
    ) {
      updateData.portfolioUrl =
        parsedData.portfolioUrl;
    }

    const updatedProfile = await db
      .update(profiles)
      .set(updateData)
      .where(
        eq(
          profiles.userId,
          payload.userId as string
        )
      )
      .returning();

    return NextResponse.json(
      updatedProfile[0],
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST Profile Error:",
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
          "Failed to update profile",
      },
      { status: 500 }
    );
  }
}

// UPDATE BASIC INFO
export async function PATCH(req: Request) {
  try {
    const payload = await authenticate(req);

    const body = await req.json();

    const parsedData =
      basicInfoSchema.parse(body);

    const updateData: {
      firstName?: string;
      lastName?: string;
    } = {};

    if (
      parsedData.firstName !== undefined
    ) {
      updateData.firstName =
        parsedData.firstName;
    }

    if (
      parsedData.lastName !== undefined
    ) {
      updateData.lastName =
        parsedData.lastName;
    }

    const updatedProfile = await db
      .update(profiles)
      .set(updateData)
      .where(
        eq(
          profiles.userId,
          payload.userId as string
        )
      )
      .returning();

    return NextResponse.json(
      updatedProfile[0],
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH Profile Error:",
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
          "Failed to update profile",
      },
      { status: 500 }
    );
  }
}

// DELETE PROFILE
export async function DELETE(req: Request) {
  try {
    const payload = await authenticate(req);

    const deletedProfile = await db
      .delete(profiles)
      .where(
        eq(
          profiles.userId,
          payload.userId as string
        )
      )
      .returning();

    if (deletedProfile.length === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Profile deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "DELETE Profile Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete profile",
      },
      { status: 500 }
    );
  }
}