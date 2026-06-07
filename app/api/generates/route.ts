import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth/authenticate";
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from "docx";

export async function POST(req: Request) {
  try {
    // 1. Authenticate (so your API tool still needs the Bearer token)
    await authenticate(req);
    const { jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    console.log("⚠️ Serving Mock Data as a Word Document...");

    // 2. The Mock Data
    const mockResume = {
      professionalSummary: "Results-oriented Full Stack Software Engineer with expertise in Next.js, React, and PostgreSQL. Proven ability to architect custom solutions from scratch, optimize complex database queries with Drizzle ORM, and build highly performant, low-bandwidth applications.",
      tailoredExperiences: [
        {
          company: "IIIT Bhubaneswar Projects",
          title: "Full Stack Developer (Next.js & Node.js)",
          optimizedBullets: [
            "Architected and developed IMS.proc, a high-performance inventory tracking application using Next.js and PostgreSQL.",
            "Built Gram Vani from scratch, designing context-aware systems optimized for low-bandwidth environments.",
            "Designed complex database relations using Drizzle ORM, ensuring fast and scalable data retrieval."
          ]
        }
      ],
      relevantSkills: [
        "Next.js (App Router)", "TypeScript", "React", "PostgreSQL", 
        "Drizzle ORM", "Node.js/Fastify", "Linux System Architecture"
      ]
    };

    // 3. Generate the ATS-Friendly Word Document
    const doc = new Document({
      styles: {
        default: { document: { run: { font: "Arial", size: 22, color: "000000" } } },
        paragraphStyles: [
          {
            id: "ATSHeading",
            name: "ATS Heading",
            basedOn: "Normal",
            next: "Normal",
            run: { font: "Arial", size: 28, bold: true, color: "000000" },
            paragraph: {
              spacing: { before: 300, after: 120 },
              border: { bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 } },
            },
          },
        ],
      },
      sections: [
        {
          properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Sambhu", font: "Arial", size: 36, bold: true })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
              children: [new TextRun({ text: "Software Engineer | student@iiit-bh.ac.in | Rourkela, Odisha" })],
            }),
            new Paragraph({ text: "Professional Summary", style: "ATSHeading" }),
            new Paragraph({ text: mockResume.professionalSummary, spacing: { after: 200 }, alignment: AlignmentType.JUSTIFIED }),
            new Paragraph({ text: "Technical Skills", style: "ATSHeading" }),
            new Paragraph({ text: mockResume.relevantSkills.join(", "), spacing: { after: 200 } }),
            new Paragraph({ text: "Professional Experience", style: "ATSHeading" }),
            ...mockResume.tailoredExperiences.flatMap((exp) => [
              new Paragraph({
                spacing: { before: 150, after: 50 },
                children: [
                  new TextRun({ text: exp.title, bold: true, size: 24 }),
                  new TextRun({ text: ` — ${exp.company}`, size: 24 }),
                ],
              }),
              ...exp.optimizedBullets.map(
                (bullet) => new Paragraph({ text: bullet, bullet: { level: 0 }, spacing: { before: 40, after: 40 } })
              ),
            ]),
          ],
        },
      ],
    });

    // 4. Convert to Buffer (Node.js environment) instead of Blob (Browser environment)
    const buffer = await Packer.toBuffer(doc);

    // 4.1 Convert Node.js Buffer to a Uint8Array (ArrayBufferView) so it's compatible with Web Response / NextResponse
    const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    // 4.2 Copy the bytes into a new ArrayBuffer (ensures we don't accidentally pass a SharedArrayBuffer)
    const arrayBuffer = new Uint8Array(uint8Array).buffer;

    // 5. Return the ArrayBuffer as a downloadable file response
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Sambhu_Resume.docx"`,
      },
    });

  } catch (error) {
    console.error("🔥 CRITICAL GENERATION ERROR:", error);
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 });
  }
}