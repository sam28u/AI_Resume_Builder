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
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage the core data used to generate your tailored resumes.</p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="animate-spin mb-4" size={32} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">

            {/* 1. Basic Info */}
            <section className="bg-card border border-border rounded-3xl p-8 shadow-sm relative group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white text-4xl font-bold uppercase shadow-inner">
                    {profile?.firstName?.charAt(0) || userEmail?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">
                      {profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}` : "Update Profile"}
                    </h2>
                    {userEmail && <p className="text-muted-foreground font-medium flex items-center gap-2 mt-2"><Mail size={16} /> {userEmail}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {profile?.githubUrl && (
                      <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-muted rounded-full hover:bg-primary/10 transition-colors flex items-center justify-center">
                        <Image src="/github.svg" alt="GitHub" width={20} height={20} className="opacity-70 dark:invert" />
                      </a>
                    )}
                    {profile?.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-muted rounded-full hover:bg-primary/10 transition-colors flex items-center justify-center">
                        <Image src="/linkedin.svg" alt="LinkedIn" width={20} height={20} className="opacity-70 dark:invert" />
                      </a>
                    )}
                    {profile?.portfolioUrl && (
                      <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center">
                        <Globe size={20} />
                      </a>
                    )}
                  </div>
                  <button onClick={() => router.push("/me/profile")} className="p-3 text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"><Pencil size={20} /></button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 2. Experience */}
              <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3"><Briefcase className="text-blue-500" size={26} /> Experience</h3>
                  <button onClick={() => router.push("/me/experience/new")} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20"><Plus size={20} /></button>
                </div>
                {experiences.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm">No experience added yet.</p>
                ) : (
                  <div className="space-y-8">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="group relative pl-5 border-l-2 border-muted">
                        <div className="absolute w-3.5 h-3.5 bg-blue-500 rounded-full -left-[9px] top-1.5" />
                        <div className="flex justify-between items-start pr-8">
                          <h4 className="font-bold text-lg">{exp.title}</h4>
                          <button onClick={() => router.push(`/me/experience/${exp.id}`)} className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-primary transition-all"><Pencil size={18} /></button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground mb-3 mt-1">
                          <span className="text-foreground">{exp.company}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          {exp.descriptionBullets?.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 3. Education */}
              <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3"><GraduationCap className="text-purple-500" size={26} /> Education</h3>
                  <button onClick={() => router.push("/me/education/new")} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20"><Plus size={20} /></button>
                </div>
                {educations.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm">No education added yet.</p>
                ) : (
                  <div className="space-y-8">
                    {educations.map((edu) => (
                      <div key={edu.id} className="group relative pl-5 border-l-2 border-muted">
                        <div className="absolute w-3.5 h-3.5 bg-purple-500 rounded-full -left-[9px] top-1.5" />
                        <div className="flex justify-between items-start pr-8">
                          <h4 className="font-bold text-lg">{edu.institution}</h4>
                          <button onClick={() => router.push(`/me/education/${edu.id}`)} className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-primary transition-all"><Pencil size={18} /></button>
                        </div>
                        <div className="text-sm font-medium text-foreground mb-2 mt-1">{edu.degree} in {edu.fieldOfStudy}</div>
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                          <Calendar size={14} /> {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 4. Projects */}
              <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3"><Code className="text-indigo-500" size={26} /> Projects</h3>
                  <button onClick={() => router.push("/me/project/new")} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20"><Plus size={20} /></button>
                </div>
                {projects.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm">No projects added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((proj) => (
                      <div key={proj.id} className="group p-5 bg-muted/40 border border-border rounded-2xl relative">
                        <div className="flex justify-between items-start mb-3 pr-24">
                          <h4 className="font-bold">{proj.name}</h4>
                          <div className="absolute right-4 top-4 flex gap-2">
                            {proj.githubLink && (
                              <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity flex items-center justify-center p-1">
                                <Image src="/github.svg" alt="GitHub" width={18} height={18} className="opacity-70 dark:invert" />
                              </a>
                            )}
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity flex items-center justify-center p-1 text-muted-foreground hover:text-primary">
                                <ExternalLink size={18} />
                              </a>
                            )}
                            <button onClick={() => router.push(`/me/project/${proj.id}`)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all ml-2"><Pencil size={18} /></button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{proj.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {proj.technologies?.map((t, i) => <span key={i} className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-semibold">{t}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 5. Skills */}
              <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-5 mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Lightbulb className="text-amber-500" size={26} /> Skills
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingSkills(!isEditingSkills)}
                      className={`p-2 rounded-xl transition-all ${isEditingSkills ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                    >
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => router.push("/me/skill/new")} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {skills.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm">No skills added yet.</p>
                ) : (
                  <div className="space-y-8">
                    {skills.map((group) => (
                      <div key={group.id} className="group relative">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">{group.category}</h4>
                          {isEditingSkills && (
                            <button
                              onClick={() => router.push(`/me/skill/${group.id}`)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {group.items.map((item, i) => (
                            <div key={i} className="relative inline-flex items-center">
                              {/* Standard uniform style for all skills */}
                              <span className="px-3.5 py-1.5 bg-muted/50 border border-border text-foreground rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.proficiency && (
                                  <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-bold">
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
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-transform hover:scale-110"
                                >
                                  <X size={12} />
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