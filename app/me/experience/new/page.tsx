"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, Briefcase, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createExperience } from "@/lib/api";

export default function NewExperiencePage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
    });

    const [isCurrentRole, setIsCurrentRole] = useState(false);
    const [descriptionBullets, setDescriptionBullets] = useState<string[]>([""]);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBulletChange = (index: number, value: string) => {
        const newBullets = [...descriptionBullets];
        newBullets[index] = value;
        setDescriptionBullets(newBullets);
    };

    const addBullet = () => {
        setDescriptionBullets([...descriptionBullets, ""]);
    };

    const removeBullet = (index: number) => {
        if (descriptionBullets.length === 1) return; // Keep at least one input
        const newBullets = descriptionBullets.filter((_, i) => i !== index);
        setDescriptionBullets(newBullets);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess(false);

        const cleanedBullets = descriptionBullets.filter(bullet => bullet.trim() !== "");

        try {
            await createExperience({
                title: formData.title.trim(),
                company: formData.company.trim(),
                startDate: formData.startDate,
                // If isCurrentRole is true, ensure we send undefined or null
                endDate: isCurrentRole ? null : formData.endDate,
                descriptionBullets: cleanedBullets,
            });

            setSuccess(true);
            setTimeout(() => {
                router.push("/me");
            }, 1500);
        } catch (err) {
            console.error("Failed to create experience:", err);
            setError("Failed to save experience. Please check your inputs.");
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/10 flex flex-col">
            <Navbar />

            <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
                <Link
                    href="/me"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft size={16} /> Back to Profile
                </Link>

                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Add Experience</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Add a new work experience to your profile.
                    </p>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="p-6 md:p-10">

                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500 text-sm font-medium">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-600 dark:text-green-400 text-sm font-medium">
                                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                                <p>Experience added successfully! Redirecting...</p>
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Core Details Section */}
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
                                    <Briefcase size={20} className="text-blue-500" />
                                    Role Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label htmlFor="title" className="block text-sm font-bold text-foreground">
                                            Job Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="title"
                                            name="title"
                                            type="text"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Frontend Engineer"
                                            className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="company" className="block text-sm font-bold text-foreground">
                                            Company <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="company"
                                            name="company"
                                            type="text"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="e.g. TechNova Solutions"
                                            className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="startDate" className="block text-sm font-bold text-foreground">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="startDate"
                                            name="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="endDate" className="block text-sm font-bold text-foreground">
                                                End Date
                                            </label>
                                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isCurrentRole}
                                                    onChange={(e) => setIsCurrentRole(e.target.checked)}
                                                    className="rounded border-border text-primary focus:ring-primary"
                                                />
                                                I currently work here
                                            </label>
                                        </div>
                                        <input
                                            id="endDate"
                                            name="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            disabled={isCurrentRole}
                                            required={!isCurrentRole}
                                            className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description Bullets Section */}
                            <div>
                                <h3 className="text-lg font-bold flex items-center justify-between mb-4 border-b border-border pb-2">
                                    <span>Description & Achievements</span>
                                    <span className="text-xs font-normal text-muted-foreground">Keep it action-oriented</span>
                                </h3>

                                <div className="space-y-3">
                                    {descriptionBullets.map((bullet, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="mt-4 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <input
                                                type="text"
                                                value={bullet}
                                                onChange={(e) => handleBulletChange(index, e.target.value)}
                                                placeholder="e.g. Architected a scalable Next.js application, improving load times by 40%..."
                                                className="flex-1 p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm leading-relaxed"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeBullet(index)}
                                                disabled={descriptionBullets.length === 1}
                                                className="p-4 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addBullet}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                                >
                                    <Plus size={16} /> Add Another Bullet
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-border">
                            <button
                                type="button"
                                onClick={() => router.push("/me")}
                                disabled={isSaving}
                                className="px-6 py-3.5 bg-muted text-foreground font-bold rounded-full hover:bg-muted/80 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <><Loader2 size={20} className="animate-spin" /> Saving...</>
                                ) : (
                                    <><Save size={20} /> Save Experience</>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}