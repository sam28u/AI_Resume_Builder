"use client";

import { motion } from "framer-motion";
import { FileText, Database, Brain, Plus, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    { label: "Total Resumes", value: "3", icon: FileText, color: "text-blue-500" },
    { label: "Data Entries", value: "12", icon: Database, color: "text-purple-500" },
    { label: "AI Generations", value: "8", icon: Brain, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold mb-8 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-linear-to-br from-primary to-blue-600" />
            ResuForge
          </div>
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium">
              <Database size={18} /> Dashboard
            </Link>
            <Link href="/dashboard/resumes" className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              <FileText size={18} /> My Resumes
            </Link>
          </nav>
        </div>
        <button className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-red-500 transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Overview</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:scale-105 transition-transform">
            <Plus size={18} /> Create New Resume
          </button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm"
            >
              <stat.icon className={`mb-4 ${stat.color}`} size={24} />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </section>

        {/* Placeholder for Recent Activity */}
        <section className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-semibold mb-6">Recent Activity</h2>
          <div className="text-sm text-muted-foreground italic">
            No recent activity found. Generate your first resume to get started!
          </div>
        </section>
      </main>
    </div>
  );
}