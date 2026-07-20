"use client";

import { motion } from "framer-motion";
import { FileText, Database, Lightbulb, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getDashboardData, Resume } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  
  // Updated state metrics
  const [metrics, setMetrics] = useState({ resumesGenerated: 0, dataEntries: 0, totalSkills: 0 });
  const [recentResumes, setRecentResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardData();
        setMetrics(data.stats);
        setRecentResumes(data.recentActivity);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Could not load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Updated Config with the new metrics and icons
  const statsConfig = [
    { label: "Resumes Generated", value: metrics.resumesGenerated, icon: FileText, color: "text-blue-500" },
    { label: "Data Entries", value: metrics.dataEntries, icon: Database, color: "text-purple-500" },
    { label: "Total Skills", value: metrics.totalSkills, icon: Lightbulb, color: "text-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <button 
            onClick={() => router.push("/dashboard/resumes/new")}
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-medium hover:scale-105 transition-transform w-full sm:w-auto justify-center"
          >
            <Plus size={18} /> Create New Resume
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="animate-spin mb-4" size={32} />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{error}</div>
        ) : (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {statsConfig.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <stat.icon className={`mb-4 ${stat.color}`} size={28} />
                  <div className="text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </section>

            {/* Recent Resumes List */}
            <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="font-bold text-xl mb-6">Recent Resumes</h2>
              {recentResumes.length === 0 ? (
                <div className="text-sm text-muted-foreground italic text-center py-8">
                  No recent activity found. Generate your first resume to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {recentResumes.map((resume) => (
                    <div key={resume.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">
                            {resume.jobDescription ? `Target: ${resume.jobDescription.substring(0, 40)}...` : "Untitled Resume"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">Resume Generation</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground shrink-0 bg-muted px-3 py-1 rounded-full">
                        {new Date(resume.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}