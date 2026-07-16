"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createResume } from "@/lib/api";

export default function NewResumePage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return setError("Please paste a job description first.");
    
    setIsGenerating(true);
    setError("");

    try {
      const newResume = await createResume({
        jobDescription: jobDescription,
        generatedContent: { status: "processing" } 
      });
      router.push(`/dashboard/resumes/${newResume.id}`);
    } catch (err) {
      setError("Failed to generate your resume. Please try again.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        <Link 
          href="/dashboard/resumes" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Resumes
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Tailor a New Resume</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Paste the job description below. Our AI will analyze the requirements and align your profile data to maximize your ATS score.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden"
        >
          <form onSubmit={handleGenerate} className="p-6 md:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500 text-sm font-medium">
                <AlertCircle size={18} className="shrink-0 mt-0.5" /> 
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <label htmlFor="jd" className="block text-sm font-bold text-foreground">
                Target Job Description
              </label>
              <textarea
                id="jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="w-full h-72 p-5 bg-muted/30 border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-base leading-relaxed"
                disabled={isGenerating}
              />
              <p className="text-xs font-medium text-muted-foreground flex items-center justify-between px-1">
                <span>AI will extract key skills and responsibilities from this text.</span>
                <span>{jobDescription.length} chars</span>
              </p>
            </div>

            <div className="flex justify-end pt-6 border-t border-border">
              <button
                type="submit"
                disabled={isGenerating || !jobDescription.trim()}
                className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <><Loader2 size={20} className="animate-spin" /> Analyzing & Generating...</>
                ) : (
                  <><Sparkles size={20} /> Generate Resume</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}