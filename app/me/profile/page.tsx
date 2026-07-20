"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, User, Link as LinkIcon, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getProfile, updateProfile, Profile } from "@/lib/api";

export default function ProfileFormPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (data) {
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            githubUrl: data.githubUrl || "",
            linkedinUrl: data.linkedinUrl || "",
            portfolioUrl: data.portfolioUrl || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load your profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      await updateProfile(formData);
      setSuccess(true);
      // Redirect back to profile after a short delay
      setTimeout(() => {
        router.push("/me");
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to save changes. Please try again.");
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
          <h1 className="text-4xl font-bold tracking-tight">Edit Basic Info</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Update your personal details and professional links.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Loading profile...</p>
            </div>
          ) : (
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
                  <p>Profile updated successfully! Redirecting...</p>
                </div>
              )}

              <div className="space-y-8">
                {/* Name Section */}
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
                    <User size={20} className="text-primary" />
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-bold text-foreground">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="e.g. Jane"
                        className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-bold text-foreground">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="e.g. Doe"
                        className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links Section */}
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
                    <LinkIcon size={20} className="text-blue-500" />
                    Professional Links
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="githubUrl" className="block text-sm font-bold text-foreground flex items-center gap-2">
                        <Image 
                          src="/github.svg" 
                          alt="GitHub" 
                          width={16} 
                          height={16} 
                          className="opacity-70 dark:invert" 
                        /> 
                        GitHub URL
                      </label>
                      <input
                        id="githubUrl"
                        name="githubUrl"
                        type="url"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="linkedinUrl" className="block text-sm font-bold text-foreground flex items-center gap-2">
                        <Image 
                          src="/linkedin.svg" 
                          alt="LinkedIn" 
                          width={16} 
                          height={16} 
                          className="opacity-70 dark:invert" 
                        /> 
                        LinkedIn URL
                      </label>
                      <input
                        id="linkedinUrl"
                        name="linkedinUrl"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="portfolioUrl" className="block text-sm font-bold text-foreground flex items-center gap-2">
                        <Globe size={16} className="text-muted-foreground" /> Portfolio URL
                      </label>
                      <input
                        id="portfolioUrl"
                        name="portfolioUrl"
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        className="w-full p-4 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                      />
                    </div>
                  </div>
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
                    <><Save size={20} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}