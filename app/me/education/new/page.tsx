"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createEducation } from "@/lib/api";

export default function NewEducationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" });
  const [isCurrent, setIsCurrent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createEducation({ ...formData, endDate: isCurrent ? null : formData.endDate });
      router.push("/me");
    } catch { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
        <Link href="/me" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Add Education</h1>
        <p className="text-muted-foreground mt-2 mb-8">Add your academic background.</p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl shadow-sm p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Institution" required onChange={(e) => setFormData({...formData, institution: e.target.value})} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Degree" required onChange={(e) => setFormData({...formData, degree: e.target.value})} />
              <input className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Field of Study" required onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="date" className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" required onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
              <input type="date" className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" disabled={isCurrent} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" onChange={(e) => setIsCurrent(e.target.checked)} className="rounded border-border" /> I currently study here
            </label>
            <button type="submit" disabled={isSaving} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90">
              {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Save Education"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}