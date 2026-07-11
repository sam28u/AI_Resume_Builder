"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, FileText, Plus, ExternalLink, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getResumes, type Resume } from "@/lib/api";

// Safely format the date to prevent "Invalid Date" crashes
const formatDate = (dateString: string) => {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "Unknown date" : date.toLocaleDateString();
};

export default function ResumesPage() {
  // TanStack Query handles loading, error, and background caching
  const { data: resumes, isLoading, error } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: getResumes,
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-4 text-sm text-muted-foreground">
        back to <Link href="/dashboard" className="text-primary hover:text-blue-800">Dashboard</Link>
      </div>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <p className="text-muted-foreground">Manage your AI-tailored documents.</p>
        </div>
        <Link 
          href="/dashboard/resumes/new" 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:scale-105 transition-transform shadow-sm"
        >
          <Plus size={18} /> New Resume
        </Link>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-500/10 rounded-2xl border border-red-500/20">
          <AlertCircle size={40} className="mb-4" />
          <p className="font-medium">Failed to load resumes</p>
          <p className="text-sm opacity-80 text-center px-4 mt-2">
            {error instanceof Error ? error.message : "An unknown error occurred."}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && resumes?.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/50">
          <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-semibold">No resumes yet</h3>
          <p className="text-muted-foreground mb-6">Create your first AI-tailored resume to get started.</p>
          <Link href="/dashboard/resumes/new" className="text-primary font-medium hover:underline">
            Create Resume →
          </Link>
        </div>
      )}

      {/* Data Grid */}
      {!isLoading && !error && resumes && resumes.length > 0 && (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <motion.div 
              key={resume.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-6 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-colors shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold line-clamp-1">
                    {resume.jobDescription || "Untitled Resume"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generated on {formatDate(resume.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => console.log(`View clicked for ID: ${resume.id}`)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
                  title="View Resume"
                >
                  <ExternalLink size={16} /> <span className="hidden sm:inline">View</span>
                </button>
                <button 
                  onClick={() => console.log(`Delete clicked for ID: ${resume.id}`)}
                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Resume"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}