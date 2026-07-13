"use client";

import { useQueries } from "@tanstack/react-query";
import { 
  getProfile, 
  getExperiences, 
  getEducations, 
  getProjects, 
  getSkills,
  clearTokens 
} from "@/lib/api";
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  Loader2, 
  AlertCircle,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

// Helper to format month/year
const formatMonthYear = (dateString: string | null) => {
  if (!dateString) return "Present";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export default function ProfilePage() {
  // Fetch everything in parallel
  const results = useQueries({
    queries: [
      { queryKey: ['profile'], queryFn: getProfile },
      { queryKey: ['experiences'], queryFn: getExperiences },
      { queryKey: ['educations'], queryFn: getEducations },
      { queryKey: ['projects'], queryFn: getProjects },
      { queryKey: ['skills'], queryFn: getSkills },
    ]
  });

  const [
    { data: profile, isLoading: isProfileLoading, error: profileError },
    { data: experiences, isLoading: isExpLoading },
    { data: educations, isLoading: isEduLoading },
    { data: projects, isLoading: isProjLoading },
    { data: skills, isLoading: isSkillLoading },
  ] = results;

  const isLoading = isProfileLoading || isExpLoading || isEduLoading || isProjLoading || isSkillLoading;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      clearTokens();
      window.location.href = "/login";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground">Loading portfolio data...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-500/10 rounded-2xl border border-red-500/20">
          <AlertCircle size={40} className="mb-4" />
          <p className="font-medium">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div>
            back to <a href="/dashboard" className="text-primary hover:text-blue-800">Dashboard</a>
        </div>
      {/* Page Header */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">Manage your personal information and portfolio.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors font-medium text-sm shadow-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: User Identity (Sticky) */}
        <div className="md:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden sticky top-8"
          >
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-br from-primary/20 to-blue-500/20" />
            
            <div className="relative w-24 h-24 rounded-full bg-background border-4 border-background shadow-md flex items-center justify-center mt-8 mb-4">
              <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold uppercase">
                {profile?.firstName?.charAt(0) || <User size={40} />}
              </div>
            </div>

            <h2 className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground mt-2">
              <Shield size={12} />
              <span className="capitalize">{profile?.role || "User"}</span>
            </div>

            <div className="w-full h-px bg-border my-6" />

            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail size={16} className="text-foreground/70" />
                <span className="truncate">{profile?.email || "Email not provided"}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Portfolio Data */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-8"
        >
          
          {/* SKILLS SECTION */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Wrench size={20} />
              </div>
              <h3 className="text-xl font-bold">Skills</h3>
            </div>
            
            {skills && skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any) => (
                  <span key={skill.id} className="px-3 py-1.5 bg-muted text-foreground text-sm font-medium rounded-md border border-border">
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No skills added yet.</p>
            )}
          </section>

          {/* EXPERIENCE SECTION */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Briefcase size={20} />
              </div>
              <h3 className="text-xl font-bold">Experience</h3>
            </div>
            
            <div className="space-y-6">
              {experiences && experiences.length > 0 ? (
                experiences.map((exp: any) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-muted">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7.5px] top-1.5 ring-4 ring-background" />
                    <h4 className="font-semibold text-lg">{exp.role}</h4>
                    <p className="text-muted-foreground text-sm font-medium">{exp.company}</p>
                    <p className="text-xs text-muted-foreground/70 mb-2 mt-1">
                      {formatMonthYear(exp.startDate)} — {formatMonthYear(exp.endDate)}
                    </p>
                    <p className="text-sm text-foreground/80 line-clamp-2">{exp.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No experience added yet.</p>
              )}
            </div>
          </section>

          {/* EDUCATION SECTION */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-xl font-bold">Education</h3>
            </div>
            
            <div className="space-y-6">
              {educations && educations.length > 0 ? (
                educations.map((edu: any) => (
                  <div key={edu.id} className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-semibold">{edu.institution}</h4>
                      <p className="text-muted-foreground text-sm">{edu.degree}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground/70">
                        {formatMonthYear(edu.startDate)} — {formatMonthYear(edu.endDate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No education added yet.</p>
              )}
            </div>
          </section>

          {/* PROJECTS SECTION */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                <FolderGit2 size={20} />
              </div>
              <h3 className="text-xl font-bold">Projects</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {projects && projects.length > 0 ? (
                projects.map((proj: any) => (
                  <div key={proj.id} className="p-4 rounded-xl border border-border bg-background/50 hover:border-indigo-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold line-clamp-1">{proj.name}</h4>
                      {proj.url && (
                        <a href={proj.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-indigo-500 transition-colors">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{proj.description}</p>
                    <p className="text-xs font-medium text-foreground/70 truncate">
                      Tech: {proj.technologies}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm sm:col-span-2">No projects added yet.</p>
              )}
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  );
}