"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { 
  getResumes, 
  getProfile, 
  generateAndDownloadResume, 
  Resume, 
  Profile 
} from "@/lib/api";

export default function ResumePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [resume, setResume] = useState<Resume | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all resumes and find the one matching this URL ID
        // (In a massive app you'd want a specific GET /api/resumes/[id] route, 
        // but this works perfectly for now)
        const [resumesData, profileData] = await Promise.all([
          getResumes(),
          getProfile()
        ]);

        const foundResume = resumesData.find((r) => r.id === id);
        
        if (!foundResume) {
          setError("Resume not found.");
        } else {
          setResume(foundResume);
          setProfile(profileData);
        }
      } catch (err) {
        setError("Failed to load resume details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownload = async () => {
    if (!id) return;
    setIsDownloading(true);
    try {
      await generateAndDownloadResume(id as string);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading your tailored resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push("/dashboard/resumes")} className="text-primary hover:underline">
            Go back to resumes
          </button>
        </div>
      </div>
    );
  }

  // The AI generated JSON payload we saved in the DB
  const content = resume.generatedContent;

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button 
            onClick={() => router.push("/dashboard/resumes")}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to Resumes
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isDownloading ? (
              <><Loader2 size={18} className="animate-spin" /> Compiling PDF...</>
            ) : (
              <><Download size={18} /> Download ATS PDF</>
            )}
          </button>
        </div>

        {/* ATS Resume Preview Paper */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black shadow-xl rounded-sm max-w-4xl mx-auto overflow-hidden border border-gray-200 min-h-[1056px] p-10 md:p-16"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Resume Header */}
          <div className="text-center mb-8 border-b border-gray-400 pb-6">
            <h1 className="text-4xl font-bold uppercase tracking-wide mb-2">
              {profile?.firstName} {profile?.lastName}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-x-4 text-sm text-gray-700">
              {/* Fallbacks if profile doesn't have these fields */}
              <span>{profile?.linkedinUrl ? profile.linkedinUrl.replace("https://", "") : "linkedin.com/in/username"}</span>
              <span>•</span>
              <span>{profile?.githubUrl ? profile.githubUrl.replace("https://", "") : "github.com/username"}</span>
              {profile?.portfolioUrl && (
                <>
                  <span>•</span>
                  <span>{profile.portfolioUrl.replace("https://", "")}</span>
                </>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {content?.professionalSummary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed text-gray-800">
                {content.professionalSummary}
              </p>
            </div>
          )}

          {/* Technical Skills */}
          {content?.relevantSkills && content.relevantSkills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">
                Technical Skills
              </h2>
              <p className="text-sm leading-relaxed text-gray-800">
                {content.relevantSkills.join(" • ")}
              </p>
            </div>
          )}

          {/* Professional Experience */}
          {content?.tailoredExperiences && content.tailoredExperiences.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">
                Professional Experience
              </h2>
              <div className="space-y-5">
                {content.tailoredExperiences.map((exp: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-base">{exp.title}</h3>
                      <span className="font-bold text-sm text-gray-700">{exp.company}</span>
                    </div>
                    {exp.optimizedBullets && exp.optimizedBullets.length > 0 && (
                      <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm text-gray-800">
                        {exp.optimizedBullets.map((bullet: string, bIndex: number) => (
                          <li key={bIndex} className="pl-1 leading-snug">{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}