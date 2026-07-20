"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, Briefcase, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getExperiences, updateExperience, deleteExperience } from "@/lib/api";

export default function EditExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
  });
  
  const [isCurrentRole, setIsCurrentRole] = useState(false);
  const [descriptionBullets, setDescriptionBullets] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const exps = await getExperiences();
        const exp = exps.find((e) => e.id === id);
        
        if (exp) {
          setFormData({
            title: exp.title,
            company: exp.company,
            startDate: exp.startDate ? exp.startDate.split('T')[0] : "",
            endDate: exp.endDate ? exp.endDate.split('T')[0] : "",
          });
          setIsCurrentRole(!exp.endDate);
          setDescriptionBullets(exp.descriptionBullets?.length ? exp.descriptionBullets : [""]);
        }
      } catch (err) {
        setError("Failed to load experience.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperience();
  }, [id]);

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
    if (descriptionBullets.length === 1) return;
    setDescriptionBullets(descriptionBullets.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await updateExperience({
        id,
        title: formData.title,
        company: formData.company,
        startDate: formData.startDate,
        endDate: isCurrentRole ? null : formData.endDate,
        descriptionBullets: descriptionBullets.filter(b => b.trim() !== ""),
      });
      setSuccess(true);
      setTimeout(() => router.push("/me"), 1500);
    } catch (err) {
      setError("Failed to update experience.");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteExperience(id);
      router.push("/me");
    } catch (err) {
      setError("Failed to delete.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
        <Link href="/me" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft size={16} /> Back to Profile
        </Link>

        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Edit Experience</h1>
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={20} /></button>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl shadow-sm">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-10">
              {error && <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl">{error}</div>}
              {success && <div className="mb-6 p-4 bg-green-500/10 text-green-600 rounded-xl">Updated successfully!</div>}

              <div className="space-y-6">
                <input name="title" value={formData.title} onChange={handleChange} className="w-full p-4 bg-muted/30 border border-border rounded-2xl" placeholder="Job Title" required />
                <input name="company" value={formData.company} onChange={handleChange} className="w-full p-4 bg-muted/30 border border-border rounded-2xl" placeholder="Company" required />
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="p-4 bg-muted/30 border border-border rounded-2xl" required />
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} disabled={isCurrentRole} className="p-4 bg-muted/30 border border-border rounded-2xl" />
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input type="checkbox" checked={isCurrentRole} onChange={(e) => setIsCurrentRole(e.target.checked)} className="rounded border-border" /> 
                  I currently work here
                </label>

                {/* Description Bullets Logic */}
                <div className="pt-4">
                  <h3 className="text-lg font-bold mb-4">Description & Achievements</h3>
                  <div className="space-y-3">
                    {descriptionBullets.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-4 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleBulletChange(index, e.target.value)}
                          placeholder="e.g. Achieved X by doing Y..."
                          className="flex-1 p-4 bg-muted/30 border border-border rounded-2xl text-sm"
                        />
                        <button type="button" onClick={() => removeBullet(index)} className="p-4 text-muted-foreground hover:text-red-500"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addBullet} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary bg-primary/10 rounded-xl">
                    <Plus size={16} /> Add Another Bullet
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-border">
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}