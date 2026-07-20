"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getEducations, updateEducation, deleteEducation } from "@/lib/api";

export default function EditEducationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [formData, setFormData] = useState({ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" });
  const [isCurrent, setIsCurrent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEdu = async () => {
      const edus = await getEducations();
      const edu = edus.find((e) => e.id === id);
      if (edu) {
        setFormData({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate.split('T')[0],
          endDate: edu.endDate ? edu.endDate.split('T')[0] : "",
        });
        setIsCurrent(!edu.endDate);
      }
      setIsLoading(false);
    };
    fetchEdu();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEducation({ id, ...formData, endDate: isCurrent ? null : formData.endDate });
    router.push("/me");
  };

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
        <Link href="/me" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft size={16} /> Back to Profile
        </Link>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Edit Education</h1>
            <button onClick={() => { deleteEducation(id); router.push("/me"); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={20}/></button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 md:p-10 rounded-3xl shadow-sm">
          {isLoading ? <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div> : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} placeholder="Institution" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} placeholder="Degree" />
                  <input className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={formData.fieldOfStudy} onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})} placeholder="Field of Study" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="date" className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  <input type="date" className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" disabled={isCurrent} value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} className="rounded border-border" /> I currently study here
              </label>
              <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90">Save Changes</button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}