"use client";

import { motion } from "framer-motion";
import { FileText, Plus, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getResumes, Resume } from "@/lib/api";

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await getResumes();
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setResumes(sorted);
      } catch (err) {
        setError("Could not load your resumes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResumes();
  }, []);

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
            <p className="text-muted-foreground mt-2">Manage and download your AI-generated resumes.</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard/resumes/new")}
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-medium hover:scale-105 transition-transform w-full sm:w-auto justify-center"
          >
            <Plus size={18} /> Create New Resume
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="animate-spin mb-4" size={32} />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{error}</div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-3xl border-dashed">
            <FileText className="text-muted-foreground mb-4" size={48} opacity={0.5} />
            <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground text-sm mb-6 text-center max-w-sm">Provide a job description and let AI tailor your perfect application.</p>
            <button 
              onClick={() => router.push("/dashboard/resumes/new")}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={18} /> Generate First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, i) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col hover:border-primary/50 hover:shadow-lg transition-all group"
              >
                <div className="p-6 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-5">
                    <FileText size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2" title={resume.jobDescription}>
                    {resume.jobDescription ? `Target: ${resume.jobDescription}` : "General Application"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {new Date(resume.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                
                <div className="bg-muted/30 border-t border-border p-4 flex items-center justify-between gap-2">
                  <button 
                    onClick={() => router.push(`/dashboard/resumes/${resume.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <ExternalLink size={16} /> View Details
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}