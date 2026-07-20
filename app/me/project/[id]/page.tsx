"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getProjects, updateProject, deleteProject } from "@/lib/api";

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [formData, setFormData] = useState({ name: "", description: "", link: "", githubLink: "", technologies: [] as string[] });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const projs = await getProjects();
            const proj = projs.find((p) => p.id === id);
            if (proj) setFormData({ ...proj, link: proj.link || "", githubLink: proj.githubLink || "" });
            setIsLoading(false);
        };
        fetch();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProject({ projectId: id, ...formData, technologies: formData.technologies.filter(t => t.trim() !== "") });
            router.push("/me");
        } catch { setError("Failed to update project."); setIsSaving(false); }
    };

    return (
        <div className="min-h-screen bg-muted/10 flex flex-col">
            <Navbar />
            <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
                <Link href="/me" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8"><ArrowLeft size={16} /> Back to Profile</Link>
                {error && <div className="p-4 mb-6 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">{error}</div>}

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Edit Project</h1>
                    <button type="button" onClick={() => { deleteProject(id); router.push("/me"); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={20} /></button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 md:p-10 rounded-3xl shadow-sm">
                    {isLoading ? <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div> : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Project Name" />
                            <textarea className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none min-h-[120px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="Live Link" />
                                <input className="p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={formData.githubLink} onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })} placeholder="GitHub Link" />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">Technologies</label>
                                {formData.technologies.map((t, i) => (
                                    <div key={i} className="flex gap-2 mb-3">
                                        <input className="flex-1 p-3 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={t} onChange={(e) => { const n = [...formData.technologies]; n[i] = e.target.value; setFormData({ ...formData, technologies: n }); }} />
                                        <button type="button" onClick={() => setFormData({ ...formData, technologies: formData.technologies.filter((_, idx) => idx !== i) })} className="p-3 text-muted-foreground hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setFormData({ ...formData, technologies: [...formData.technologies, ""] })} className="text-primary font-bold text-sm flex items-center gap-1 mt-2"><Plus size={16} /> Add Tech</button>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90">
                                {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Save Changes"}
                            </button>
                        </form>
                    )}
                </motion.div>
            </main>
        </div>
    );
}