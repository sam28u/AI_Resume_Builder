"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createProject } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", description: "", link: "", githubLink: "" });
  const [tech, setTech] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createProject({ ...formData, technologies: tech.filter(t => t.trim() !== "") });
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
        <h1 className="text-4xl font-bold tracking-tight">Add Project</h1>
        <p className="text-muted-foreground mt-2 mb-8">Showcase your technical work.</p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl shadow-sm p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Project Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <textarea className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none min-h-[120px]" placeholder="Description" required onChange={(e) => setFormData({...formData, description: e.target.value})} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Live Link" onChange={(e) => setFormData({...formData, link: e.target.value})} />
                <input className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="GitHub Link" onChange={(e) => setFormData({...formData, githubLink: e.target.value})} />
            </div>
            <div>
              <label className="block font-bold mb-2">Technologies</label>
              {tech.map((t, i) => (
                <div key={i} className="flex gap-2 mb-3">
                    <input className="flex-1 p-3 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={t} onChange={(e) => { const n = [...tech]; n[i] = e.target.value; setTech(n); }} />
                    <button type="button" onClick={() => setTech(tech.filter((_, idx) => idx !== i))} className="p-3 text-muted-foreground hover:text-red-500"><Trash2 size={18}/></button>
                </div>
              ))}
              <button type="button" onClick={() => setTech([...tech, ""])} className="text-primary font-bold text-sm flex items-center gap-1">+ Add Technology</button>
            </div>
            <button type="submit" disabled={isSaving} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90">
                {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Save Project"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}