"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function NewResumePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [jobDescription, setJobDescription] = useState("");

  // 1. Define the Mutation for generating/saving the resume
  const mutation = useMutation({
    mutationFn: async (desc: string) => {
      const res = await fetch("/api/user/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          jobDescription: desc,
          // Assuming your backend handles the generation based on the description
          generatedContent: { status: "pending" } 
        }),
      });
      
      if (!res.ok) throw new Error("Failed to generate resume");
      return res.json();
    },
    onSuccess: () => {
      // 2. Invalidate the 'resumes' list query to trigger a background refetch
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      router.push("/dashboard/resumes");
    },
  });

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(jobDescription);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link 
        href="/dashboard/resumes" 
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Resumes
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Generate New Resume</h1>
            <p className="text-muted-foreground">Paste a job description, and our AI will tailor your profile.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <textarea
              required
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
            />
          </div>

          <button 
            disabled={mutation.isPending || !jobDescription}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Tailoring Resume...
              </>
            ) : (
              <>
                <Save size={18} /> Generate Resume
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}