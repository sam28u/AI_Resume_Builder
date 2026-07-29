import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/auth/authenticate";
import { renderToStream } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// 1. Define PDF styles (Notice we do NOT export this)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  section: { marginBottom: 15 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  heading: { fontSize: 16, fontWeight: "bold", borderBottom: "1pt solid #ccc", paddingBottom: 3, marginBottom: 8, marginTop: 10 },
  text: { fontSize: 11, lineHeight: 1.5, color: "#333" }
});

// 2. Create the PDF Template Component (Notice we do NOT export this either)
const ResumePDF = ({ content }: { content: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.name}>Your Name</Text>
        <Text style={styles.text}>johndoe@email.com | (123) 456-7890</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Professional Summary</Text>
        <Text style={styles.text}>{content?.professionalSummary || "No summary provided."}</Text>
      </View>
      {content?.relevantSkills && (
        <View style={styles.section}>
          <Text style={styles.heading}>Technical Skills</Text>
          <Text style={styles.text}>{content.relevantSkills.join(", ")}</Text>
        </View>
      )}
    </Page>
  </Document>
);

// 3. The API Handler - THIS MUST BE THE ONLY EXPORT IN THE FILE
export async function GET(req: Request, context: any) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Await the params object (Required in newer Next.js versions)
    const params = await context.params;
    const resumeId = params.id;

    // Fetch the specific resume
    const [resume] = await db
      .select()
      .from(resumes)
      .where(
        and(
          eq(resumes.id, resumeId),
          eq(resumes.userId, user.userId as string)
        )
      );

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Generate the PDF stream
    const pdfStream = await renderToStream(<ResumePDF content={resume.generatedContent} />);
    
    // Convert the Node Stream into a Buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk as Uint8Array);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Return the Buffer directly to the browser
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${resumeId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error("🔥 PDF Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF", details: error.message }, { status: 500 });
  }
}