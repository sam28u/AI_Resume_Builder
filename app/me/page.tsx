"use client";

import { motion } from "framer-motion";
import { Loader2, Briefcase, GraduationCap, Code, Lightbulb, Globe, Calendar, Plus, Pencil, Mail, ExternalLink, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";

// Import all API functions and types
import {
  getProfile,
  getExperiences,
  getEducations,
  getProjects,
  getSkills,
  getUserEmail,
  Profile,
  Experience,
  Education,
  Project,
  Skill,
  deleteSkillItem
} from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const [prof, exps, edus, projs, skls] = await Promise.all([
          getProfile().catch(() => null),
          getExperiences().catch(() => []),
          getEducations().catch(() => []),
          getProjects().catch(() => []),
          getSkills().catch(() => []),
        ]);

        setProfile(prof);
        setExperiences(exps);
        setEducations(edus);
        setProjects(projs);
        setSkills(skls);
        setUserEmail(getUserEmail());

      } catch (error) {
        console.error("Failed to load profile data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background flex flex-col text-foreground">
      <Navbar />

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">Your Profile</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">Manage the core data used to generate your tailored resumes.</p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="animate-spin mb-4" size={36} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">

            {/* 1. Basic Info */}
            <section className="bg-card border border-border/60 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-4xl font-bold uppercase shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                    {profile?.firstName?.charAt(0) || userEmail?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}` : "Update Profile"}
                    </h2>
                    {userEmail && <p className="text-muted-foreground font-medium flex items-center gap-2 mt-2"><Mail size={16} className="text-primary/70" /> {userEmail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 bg-muted/50 p-1.5 rounded-full border border-border/50">
                    {profile?.githubUrl && (
                      <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground">
                        <Image src="/github.svg" alt="GitHub" width={18} height={18} className="opacity-70 dark:invert" />
                      </a>
                    )}
                    {profile?.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-blue-500">
                        <Image src="/linkedin.svg" alt="LinkedIn" width={18} height={18} className="opacity-70 dark:invert" />
                      </a>
                    )}
                    {profile?.portfolioUrl && (
                      <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-emerald-500">
                        <Globe size={18} />
                      </a>
                    )}
                  </div>
                  <button onClick={() => router.push("/me/profile")} className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-md transition-all hover:scale-105 active:scale-95"><Pencil size={20} /></button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 2. Experience */}
              <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3"><Briefcase className="text-blue-500" size={26} /> Experience</h3>
                  <button onClick={() => router.push("/me/experience/new")} className="p-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"><Plus size={20} /></button>
                </div>
                {experiences.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm text-center py-4">No experience added yet.</p>
                ) : (
                  <div className="space-y-8 pl-2">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="group relative pl-6 border-l-2 border-border/50 hover:border-blue-500/50 transition-colors">
                        <div className="absolute w-4 h-4 bg-background border-4 border-blue-500 rounded-full -left-[9px] top-1.5 shadow-sm group-hover:scale-110 transition-transform" />
                        <div className="flex justify-between items-start pr-8 group-hover:translate-x-1 transition-transform duration-300">
                          <h4 className="font-bold text-lg text-foreground">{exp.title}</h4>
                          <button onClick={() => router.push(`/me/experience/${exp.id}`)} className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-primary transition-all bg-background border border-border shadow-sm rounded-lg"><Pencil size={16} /></button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-muted-foreground mb-3 mt-1 group-hover:translate-x-1 transition-transform duration-300">
                          <span className="text-blue-500">{exp.company}</span>
                          <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-0.5 rounded-md"><Calendar size={14} /> {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground group-hover:translate-x-1 transition-transform duration-300">
                          {exp.descriptionBullets?.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 3. Education */}
              <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3"><GraduationCap className="text-purple-500" size={26} /> Education</h3>
                  <button onClick={() => router.push("/me/education/new")} className="p-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"><Plus size={20} /></button>
                </div>
                {educations.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm text-center py-4">No education added yet.</p>
                ) : (
                  <div className="space-y-8 pl-2">
                    {educations.map((edu) => (
                      <div key={edu.id} className="group relative pl-6 border-l-2 border-border/50 hover:border-purple-500/50 transition-colors">
                        <div className="absolute w-4 h-4 bg-background border-4 border-purple-500 rounded-full -left-[9px] top-1.5 shadow-sm group-hover:scale-110 transition-transform" />
                        <div className="flex justify-between items-start pr-8 group-hover:translate-x-1 transition-transform duration-300">
                          <h4 className="font-bold text-lg text-foreground">{edu.institution}</h4>
                          <button onClick={() => router.push(`/me/education/${edu.id}`)} className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-primary transition-all bg-background border border-border shadow-sm rounded-lg"><Pencil size={16} /></button>
                        </div>
                        <div className="text-sm font-semibold text-purple-500 mb-2 mt-1 group-hover:translate-x-1 transition-transform duration-300">{edu.degree} in {edu.fieldOfStudy}</div>
                        <span className="text-xs font-medium text-muted-foreground flex items-center inline-flex gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md group-hover:translate-x-1 transition-transform duration-300">
                          <Calendar size={14} /> {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 4. Projects */}
              <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3"><Code className="text-indigo-500" size={26} /> Projects</h3>
                  <button onClick={() => router.push("/me/project/new")} className="p-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"><Plus size={20} /></button>
                </div>
                {projects.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm text-center py-4">No projects added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((proj) => (
                      <div key={proj.id} className="group p-6 bg-muted/30 border border-border/60 rounded-2xl relative hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3 pr-24">
                          <h4 className="font-bold text-lg">{proj.name}</h4>
                          <div className="absolute right-4 top-4 flex gap-2">
                            {proj.githubLink && (
                              <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                                <Image src="/github.svg" alt="GitHub" width={16} height={16} className="opacity-70 dark:invert" />
                              </a>
                            )}
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/30 transition-all">
                                <ExternalLink size={16} />
                              </a>
                            )}
                            <button onClick={() => router.push(`/me/project/${proj.id}`)} className="opacity-0 group-hover:opacity-100 p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-primary transition-all ml-1"><Pencil size={16} /></button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-5 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{proj.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {proj.technologies?.map((t, i) => <span key={i} className="px-3 py-1 bg-background border border-border shadow-xs rounded-lg text-xs font-semibold text-foreground/80">{t}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 5. Skills */}
              <section className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Lightbulb className="text-amber-500" size={26} /> Skills
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingSkills(!isEditingSkills)}
                      className={`p-2.5 rounded-xl transition-all ${isEditingSkills ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                    >
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => router.push("/me/skill/new")} className="p-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {skills.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm text-center py-4">No skills added yet.</p>
                ) : (
                  <div className="space-y-8">
                    {skills.map((group) => (
                      <div key={group.id} className="group relative">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-xs text-muted-foreground/80 uppercase tracking-[0.2em] bg-muted/50 px-3 py-1 rounded-md">{group.category}</h4>
                          {isEditingSkills && (
                            <button
                              onClick={() => router.push(`/me/skill/${group.id}`)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {group.items.map((item, i) => (
                            <div key={i} className="relative inline-flex items-center">
                              {/* Standard uniform style for all skills */}
                              <span className="px-3.5 py-1.5 bg-secondary/40 border border-border/50 text-foreground rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-sm hover:border-foreground/30">
                                <span>{item.name}</span>
                                {item.proficiency && (
                                  <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest bg-background/50 px-1.5 rounded-sm">
                                    ({item.proficiency})
                                  </span>
                                )}
                              </span>
                              {isEditingSkills && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await deleteSkillItem(group.id, item.name);
                                      setSkills(prevSkills =>
                                        prevSkills.map(cat => {
                                          if (cat.id === group.id) {
                                            return {
                                              ...cat,
                                              items: cat.items.filter(i => i.name !== item.name)
                                            };
                                          }
                                          return cat;
                                        }).filter(cat => cat.items.length > 0)
                                      );
                                    } catch (err) {
                                      console.error("Failed to delete skill item", err);
                                    }
                                  }}
                                  className="absolute -top-1.5 -right-1.5 bg-background border border-border text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 rounded-full p-1 shadow-sm transition-all hover:scale-110"
                                >
                                  <X size={12} strokeWidth={2.5} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}