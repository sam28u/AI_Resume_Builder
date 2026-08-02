import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/auth/authenticate";
import { renderToStream } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// 1. ATS-Optimized Styles
const resumeStyles = StyleSheet.create({
  page: { 
    padding: "36pt 48pt",
    fontFamily: "Helvetica", 
    fontSize: 10, 
    color: "#000000" 
  },
  header: { textAlign: "center", marginBottom: 12 },
  name: { 
    fontSize: 22, 
    fontWeight: "bold", 
    textTransform: "uppercase", 
    marginBottom: 4,
    letterSpacing: 1
  },
  contactInfo: { fontSize: 9, color: "#333333" },
  section: { marginBottom: 12 },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: "bold", 
    textTransform: "uppercase", 
    borderBottom: "1pt solid #000000", 
    paddingBottom: 2, 
    marginBottom: 6 
  },
  // FIX: Updated expHeader layout to prevent overlap
  expHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", // Changed to flex-start for multiline support
    marginBottom: 2 
  },
  leftHeader: {
    flex: 1, // Forces the left side to take available space and wrap
    paddingRight: 10,
  },
  jobTitle: { fontSize: 10, fontWeight: "bold" },
  date: { 
    fontSize: 9, 
    fontWeight: "bold",
    flexShrink: 0, // Prevents the date from being squished
    textAlign: "right"
  },
  company: { fontSize: 10, fontStyle: "italic", marginBottom: 4 },
  bulletRow: { 
    flexDirection: "row", 
    marginBottom: 3, 
    paddingLeft: 8,
    paddingRight: 8
  },
  bullet: { width: 12, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.4 },
  paragraph: { fontSize: 9.5, lineHeight: 1.4, marginBottom: 4 }
});

// 2. Custom Markdown Parser Component
const FormattedText = ({ text, style }: { text: string; style?: any }) => {
  if (!text) return null;
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} style={{ fontWeight: "bold" }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
};

// 3. The PDF Template Component
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
          <FormattedText text={content.professionalSummary} style={resumeStyles.paragraph} />
        </View>
      )}

      {/* EDUCATION SECTION */}
      {content?.education && content.education.length > 0 && (
        <View style={resumeStyles.section}>
          <Text style={resumeStyles.sectionTitle}>Education</Text>
          {content.education.map((edu: any, index: number) => (
            <View key={index} style={{ marginBottom: 6 }}>
              <View style={resumeStyles.expHeader}>
                <View style={resumeStyles.leftHeader}>
                  <FormattedText text={edu.institution} style={resumeStyles.jobTitle} />
                </View>
                <Text style={resumeStyles.date}>{edu.date || ""}</Text>
              </View>
              <FormattedText text={edu.degree} style={resumeStyles.company} />
              {edu.details && (
                <FormattedText text={edu.details} style={resumeStyles.paragraph} />
              )}
            </View>
          ))}
        </View>
      )}

      {/* WORK EXPERIENCE */}
      {content?.tailoredExperiences && content.tailoredExperiences.length > 0 && (
        <View style={resumeStyles.section}>
          <Text style={resumeStyles.sectionTitle}>Experience</Text>
          {content.tailoredExperiences.map((exp: any, index: number) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={resumeStyles.expHeader}>
                <View style={resumeStyles.leftHeader}>
                  {/* FIX: Applied FormattedText to Job Title */}
                  <FormattedText text={exp.title} style={resumeStyles.jobTitle} />
                </View>
                <Text style={resumeStyles.date}>{exp.startDate ? `${exp.startDate} - ${exp.endDate || "Present"}` : ""}</Text>
              </View>
              {/* FIX: Applied FormattedText to Company */}
              <FormattedText text={exp.company} style={resumeStyles.company} />
              
              {exp.optimizedBullets && exp.optimizedBullets.map((bullet: string, bIndex: number) => (
                <View key={bIndex} style={resumeStyles.bulletRow}>
                  <Text style={resumeStyles.bullet}>•</Text>
                  <FormattedText text={bullet} style={resumeStyles.bulletText} />
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* PROJECTS SECTION */}
      {content?.projects && content.projects.length > 0 && (
        <View style={resumeStyles.section}>
          <Text style={resumeStyles.sectionTitle}>Projects</Text>
          {content.projects.map((proj: any, index: number) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={resumeStyles.expHeader}>
                <View style={resumeStyles.leftHeader}>
                  {/* FIX: Applied FormattedText to Project Title & Technologies */}
                  <FormattedText 
                    text={`${proj.name} ${proj.technologies ? `| ${proj.technologies}` : ""}`} 
                    style={resumeStyles.jobTitle} 
                  />
                </View>
                <Text style={resumeStyles.date}>{proj.date || ""}</Text>
              </View>
              
              {proj.optimizedBullets && proj.optimizedBullets.map((bullet: string, bIndex: number) => (
                <View key={bIndex} style={resumeStyles.bulletRow}>
                  <Text style={resumeStyles.bullet}>•</Text>
                  <FormattedText text={bullet} style={resumeStyles.bulletText} />
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
          {typeof content.relevantSkills[0] === 'string' ? (
            <FormattedText 
              text={content.relevantSkills.join(", ")} 
              style={resumeStyles.paragraph} 
            />
          ) : (
            content.relevantSkills.map((skillGroup: any, index: number) => (
              <Text key={index} style={resumeStyles.paragraph}>
                <Text style={{ fontWeight: "bold" }}>{skillGroup.category}: </Text>
                {/* FIX: Applied FormattedText to the skills array */}
                <FormattedText text={skillGroup.skills.join(", ")} />
              </Text>
            ))
          )}
        </View>
      )}

    </Page>
  </Document>
);

// 4. The API Handler
export async function GET(req: Request, context: any) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const resumeId = params.id;

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

    const rawUserData = await db.query.users.findFirst({
      where: (users: any, { eq }: any) => eq(users.id, user.userId as string),
      with: { profile: true },
    });

    const pdfStream = await renderToStream(
      <ResumePDF 
        content={resume.generatedContent} 
        profile={rawUserData?.profile} 
      />
    );
    
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