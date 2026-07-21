"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { createSkillCategory, getSkills, Skill } from "@/lib/api";

export default function NewSkillPage() {
    const router = useRouter();
    const [category, setCategory] = useState("");
    const [items, setItems] = useState([{ name: "", proficiency: "beginner" as const }]);
    const [isSaving, setIsSaving] = useState(false);
    // Added state for existing categories
    const [existingCategories, setExistingCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchExisting = async () => {
            const skills = await getSkills();
            // Extract unique categories from existing skills
            const categories = Array.from(new Set(skills.map(s => s.category)));
            setExistingCategories(categories);
        };
        fetchExisting();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await createSkillCategory({ category, items });
            router.push("/me");
        } catch {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/10 flex flex-col">
            <Navbar />
            <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
                <Link href="/me" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft size={16} /> Back to Profile
                </Link>
                <h1 className="text-4xl mb-5 font-bold tracking-tight">Add Skills</h1>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl shadow-sm p-6 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Updated Input with Datalist for suggestions */}
                        <div>
                            <label className="block font-bold mb-2">Category</label>
                            <input 
                                list="category-suggestions"
                                className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" 
                                placeholder="e.g. Frontend Development" 
                                required 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)} 
                            />
                            <datalist id="category-suggestions">
                                {existingCategories.map((cat) => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block font-bold mb-3">Skill Items</label>
                            {items.map((item, i) => (
                                <div key={i} className="flex gap-2 mb-3">
                                    <input className="flex-1 p-3 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Skill Name" value={item.name} onChange={(e) => { const n = [...items]; n[i].name = e.target.value; setItems(n); }} required />
                                    <select className="p-3 bg-muted/30 border border-border rounded-2xl outline-none" value={item.proficiency} onChange={(e) => { const n = [...items]; n[i].proficiency = e.target.value as any; setItems(n); }}>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                    <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="p-3 text-muted-foreground hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setItems([...items, { name: "", proficiency: "beginner" }])} className="text-primary font-bold text-sm flex items-center gap-1 mt-2"><Plus size={16} /> Add Skill</button>
                        </div>

                        <button type="submit" disabled={isSaving} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90">
                            {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Save Skills"}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}