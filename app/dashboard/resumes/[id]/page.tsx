"use client";

import { motion } from "framer-motion";
import { FileText, ArrowLeft, Loader2, Download, Code } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getResumes, generateAndDownloadResume, Resume } from "@/lib/api";

export default function ResumeDetailPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Note: Kept your dummy data test structure here so it still functions for you
    const fetchResume = async () => {
      try {
        setIsLoading(true);
        const dummyResume: Resume = {
          id: resumeId || "test-123",
          userId: "user-456",
          jobDescription: "Senior Frontend Engineer\n\nRequirements:\n- 5+ years of experience with React and Next.js\n- Strong proficiency in TypeScript and Tailwind CSS",
          generatedContent: { professionalSummary: "Results-driven Senior Frontend Engineer...", relevantSkills: ["React", "Next.js"] },
          createdAt: new Date().toISOString()
        };
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResume(dummyResume);
      } catch (err) {
        setError("Failed to load resume details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (resumeId) fetchResume();
  }, [resumeId]);

  const handleDownload = async () => {
    if (!resume?.jobDescription) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Test Mode: Download triggered successfully!");
    } catch (err) {
      alert("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
        <Link href="/dashboard/resumes" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Resumes
        </Link>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="animate-spin mb-4" size={32} />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{error}</div>
        ) : resume ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary"><FileText size={28} /></div>
                  Resume Details
                </h1>
                <p className="text-muted-foreground font-medium mt-2 text-sm">
                  Generated on {new Date(resume.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isDownloading ? "Generating PDF..." : "Download PDF"}
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col h-[600px]">
                <h2 className="font-bold text-xl mb-6 border-b border-border pb-4">Target Job Description</h2>
                <div className="flex-1 overflow-y-auto pr-4 text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {resume.jobDescription || "No job description provided."}
                </div>
              </div>
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col h-[600px]">
                <h2 className="font-bold text-xl mb-6 flex items-center gap-2 border-b border-border pb-4">
                  <Code size={20} className="text-muted-foreground" /> Generated Content Logic
                </h2>
                <div className="flex-1 overflow-y-auto text-sm bg-muted/50 p-6 rounded-2xl font-mono text-muted-foreground">
                  <pre>{JSON.stringify(resume.generatedContent, null, 2)}</pre>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}