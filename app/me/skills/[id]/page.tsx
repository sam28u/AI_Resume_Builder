"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getSkills, updateSkillCategory, deleteSkillCategory } from "@/lib/api";

export default function EditSkillPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [formData, setFormData] = useState({ category: "", items: [] as any[] });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            const all = await getSkills();
            const skill = all.find((s) => s.id === id);
            if (skill) setFormData({ category: skill.category, items: skill.items });
            setIsLoading(false);
        };
        fetch();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await updateSkillCategory({ skillId: id, ...formData });
        deleteSkillCategory(id);
        router.push("/me");
    };

    return (
        <div className="min-h-screen bg-muted/10 flex flex-col">
            <Navbar />
            <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
                <Link href="/me" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8"><ArrowLeft size={16} /> Back</Link>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Edit Skills</h1>
                    <button type="button" onClick={() => { deleteSkillCategory(id); router.push("/me"); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={20} /></button>
                </div>

                <motion.div className="bg-card border border-border p-6 md:p-10 rounded-3xl shadow-sm">
                    {isLoading ? <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div> : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />

                            <div>
                                <label className="block font-bold mb-3">Skill Items</label>
                                {formData.items.map((item, i) => (
                                    <div key={i} className="flex gap-2 mb-3">
                                        <input className="flex-1 p-3 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" value={item.name} onChange={(e) => { const n = [...formData.items]; n[i].name = e.target.value; setFormData({ ...formData, items: n }); }} />
                                        <button type="button" onClick={() => setFormData({ ...formData, items: formData.items.filter((_, idx) => idx !== i) })} className="p-3 text-muted-foreground hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setFormData({ ...formData, items: [...formData.items, { name: "", proficiency: "beginner" }] })} className="text-primary font-bold text-sm flex items-center gap-1 mt-2"><Plus size={16} /> Add Skill</button>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-full">
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    )}
                </motion.div>
            </main>
        </div>
    );
}