import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

interface ResumeData {
  professionalSummary: string;
  tailoredExperiences: {
    company: string;
    title: string;
    optimizedBullets: string[];
  }[];
  relevantSkills: string[];
}

export async function downloadResumeAsWord(resumeData: ResumeData) {
  const doc = new Document({
    // 1. ATS RULE: Set explicit standard fonts and sizes globally
    styles: {
      default: {
        document: {
          run: {
            font: "Arial", // Standard ATS-safe font
            size: 22, // 11pt font (docx uses half-points, so 22 = 11pt)
            color: "000000",
          },
        },
      },
      paragraphStyles: [
        {
          id: "ATSHeading",
          name: "ATS Heading",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Arial",
            size: 28, // 14pt
            bold: true,
            color: "000000",
          },
          paragraph: {
            spacing: { before: 300, after: 120 }, // Clean white space
            border: {
              bottom: {
                color: "000000",
                space: 1,
                size: 6,
                style: "none",
              },
            },
          },
        },
      ],
    },
    sections: [
      {
        // 2. ATS RULE: Standard 1-inch margins (1440 twips = 1 inch)
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // --- HEADER / CONTACT INFO ---
          // ATS bots look for this at the very top, centered or left-aligned
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Sambhu", // 👈 Updated to Sambhu
                font: "Arial",
                size: 36, // 18pt
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Software Engineer | student@iiit-bh.ac.in | Rourkela, Odisha | GitHub/LinkedIn URLs",
              }),
            ],
          }),

          // --- PROFESSIONAL SUMMARY ---
          new Paragraph({
            text: "Professional Summary",
            style: "ATSHeading",
          }),
          new Paragraph({
            text: resumeData.professionalSummary,
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          // --- TECHNICAL SKILLS ---
          // ATS bots look specifically for the exact phrase "Technical Skills" or "Skills"
          new Paragraph({
            text: "Technical Skills",
            style: "ATSHeading",
          }),
          new Paragraph({
            text: resumeData.relevantSkills.join(", "), // Flat, comma-separated list is best for parsing
            spacing: { after: 200 },
          }),

          // --- PROFESSIONAL EXPERIENCE ---
          // ATS looks for "Professional Experience" or "Work Experience"
          new Paragraph({
            text: "Professional Experience",
            style: "ATSHeading",
          }),

          ...resumeData.tailoredExperiences.flatMap((exp) => [
            // Job Title & Company (Cleanly separated)
            new Paragraph({
              spacing: { before: 150, after: 50 },
              children: [
                new TextRun({ text: exp.title, bold: true, size: 24 }), // 12pt bold for Role
                new TextRun({ text: ` — ${exp.company}`, size: 24 }),
              ],
            }),

            // Bullets (Using standard bullet points)
            ...exp.optimizedBullets.map(
              (bullet) =>
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 }, // Native Word bullet point, highly readable by ATS
                  spacing: { before: 40, after: 40 },
                }),
            ),
          ]),

          // Note: When you add Education to the AI schema later, you will add it here
          // using the exact same ATSHeading style.
        ],
      },
    ],
  });

  // Pack and trigger download
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Resume.docx");
}
