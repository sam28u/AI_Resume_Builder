import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/auth/authenticate";
import { renderToStream } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// 1. ATS-Optimized Styles (Mimicking the classic Harvard/ATS layout)
const resumeStyles = StyleSheet.create({
  page: { 
    padding: "36pt 48pt", // 0.5" top/bottom, ~0.65" left/right margins
    fontFamily: "Helvetica", 
    fontSize: 10, 
    color: "#000000" 
  },
  header: { 
    textAlign: "center", 
    marginBottom: 12 
  },
  name: { 
    fontSize: 22, 
    fontWeight: "bold", 
    textTransform: "uppercase", 
    marginBottom: 4,
    letterSpacing: 1
  },
  contactInfo: { 
    fontSize: 9, 
    color: "#333333" 
  },
  section: { 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: "bold", 
    textTransform: "uppercase", 
    borderBottom: "1pt solid #000000", 
    paddingBottom: 2, 
    marginBottom: 6 
  },
  // Experience Block Styles
  expHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-end",
    marginBottom: 2 
  },
  jobTitle: { 
    fontSize: 10, 
    fontWeight: "bold" 
  },
  date: { 
    fontSize: 9,
    fontWeight: "bold" 
  },
  company: { 
    fontSize: 10, 
    fontStyle: "italic", 
    marginBottom: 4 
  },
  // Bullet Point Styles
  bulletRow: { 
    flexDirection: "row", 
    marginBottom: 3, 
    paddingLeft: 8,
    paddingRight: 8
  },
  bullet: { 
    width: 12, 
    fontSize: 10 
  },
  bulletText: { 
    flex: 1, 
    fontSize: 9.5, 
    lineHeight: 1.4 
  },
  // General Text
  paragraph: { 
    fontSize: 9.5, 
    lineHeight: 1.4,
    marginBottom: 4
  }
});

// 2. The PDF Template Component
const ResumePDF = ({ content, profile }: { content: any; profile: any }) => (
  <Document>
    <Page size="A4" style={resumeStyles.page}>
      
      {/* HEADER SECTION */}
      <View style={resumeStyles.header}>
        <Text style={resumeStyles.name}>
          {profile?.firstName || "First"} {profile?.lastName || "Last"}
        </Text>
        <Text style={resumeStyles.contactInfo}>
          {profile?.email || "email@example.com"} 
          {profile?.linkedinUrl ? ` | ${profile.linkedinUrl.replace("https://", "").replace("www.", "")}` : ""}
          {profile?.githubUrl ? ` | ${profile.githubUrl.replace("https://", "").replace("www.", "")}` : ""}
        </Text>
      </View>

      {/* PROFESSIONAL SUMMARY */}
      {content?.professionalSummary && (
        <View style={resumeStyles.section}>
          <Text style={resumeStyles.sectionTitle}>Professional Summary</Text>
          <Text style={resumeStyles.paragraph}>{content.professionalSummary}</Text>
        </View>
      )}

      {/* WORK EXPERIENCE */}
      {content?.tailoredExperiences && content.tailoredExperiences.length > 0 && (
        <View style={resumeStyles.section}>
          <Text style={resumeStyles.sectionTitle}>Experience</Text>
          
          {content.tailoredExperiences.map((exp: any, index: number) => (
            <View key={index} style={{ marginBottom: 8 }}>
              {/* Job Title and Date on the same line */}
              <View style={resumeStyles.expHeader}>
                <Text style={resumeStyles.jobTitle}>{exp.title}</Text>
                <Text style={resumeStyles.date}>{exp.startDate ? `${exp.startDate} - ${exp.endDate || "Present"}` : ""}</Text>
              </View>
              {/* Company Name below */}
              <Text style={resumeStyles.company}>{exp.company}</Text>
              
              {/* Bullets */}
              {exp.optimizedBullets && exp.optimizedBullets.map((bullet: string, bIndex: number) => (
                <View key={bIndex} style={resumeStyles.bulletRow}>
                  <Text style={resumeStyles.bullet}>•</Text>
                  <Text style={resumeStyles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* TECHNICAL SKILLS */}
      {content?.relevantSkills && content.relevantSkills.length > 0 && (
        <View style={resumeStyles.section}>
          <Text style={resumeStyles.sectionTitle}>Skills</Text>
          <Text style={resumeStyles.paragraph}>
            {content.relevantSkills.join(", ")}
          </Text>
        </View>
      )}

    </Page>
  </Document>
);

// 3. The API Handler
export async function GET(req: Request, context: any) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    // Fetch the user's profile data to populate the header
    const rawUserData = await db.query.users.findFirst({
      where: (users: any, { eq }: any) => eq(users.id, user.userId as string),
      with: { profile: true },
    });

    // Generate the PDF stream, passing both the AI content and the user profile
    const pdfStream = await renderToStream(
      <ResumePDF 
        content={resume.generatedContent} 
        profile={rawUserData?.profile} 
      />
    );
    
    // Convert Stream to Buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk as Uint8Array);
    }
    const pdfBuffer = Buffer.concat(chunks);

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