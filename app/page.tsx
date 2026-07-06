"use client";

import Link from "next/link";
import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle"; 
import { Brain, FileText, Database, ArrowRight, Terminal } from "lucide-react"; 

// --- Animation Variants ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function LandingPage() {
  // --- 3D Hover Interaction Logic ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Add spring physics for smooth, heavy movement
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse position to rotation angles (max 15 degrees)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate percentage from center (-0.5 to 0.5)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-500">
      
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none -z-10" />

      {/* NAVIGATION BAR */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6"
      >
        <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm shadow-md">
            <Terminal size={16} />
          </div>
          ResuForge
        </div>
        <div className="flex items-center space-x-6 text-sm font-medium">
          <ThemeToggle />
          <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all block"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Copy */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center lg:text-left">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Powered by Groq & Llama-3
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              The ATS-Perfect Resume, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Engineered by AI.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Stop fighting with Word documents and broken PDF converters. We use raw data and Typst compilation to generate pixel-perfect, machine-readable resumes tailored to your next job.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link 
                  href="/register"
                  className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-foreground text-background font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Start Building Free <ArrowRight size={18} />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column: 3D Interactive Floating Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex justify-center relative"
            style={{ perspective: 1000 }}
          >
            {/* The invisible interaction layer */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="absolute inset-0 z-30 w-full h-full cursor-crosshair"
            />

            {/* The 3D Rotating Resume Card */}
            <motion.div 
              style={{ rotateX, rotateY }}
              className="w-[400px] h-[500px] bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 overflow-hidden relative"
            >
              {/* Dynamic Interactive Glow that follows the mouse */}
              <motion.div 
                className="absolute inset-0 z-0 opacity-30 pointer-events-none"
                style={{
                  background: useTransform(
                    [mouseXSpring, mouseYSpring],
                    ([latestX, latestY]: any) => {
                      const xPos = (latestX + 0.5) * 100;
                      const yPos = (latestY + 0.5) * 100;
                      return `radial-gradient(circle at ${xPos}% ${yPos}%, rgba(59,130,246,0.4) 0%, transparent 50%)`;
                    }
                  )
                }}
              />

              {/* Fake AI Scanner Line (Vertical now for a cool scanning effect) */}
              <motion.div 
                animate={{ left: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute top-0 bottom-0 w-[2px] bg-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20 pointer-events-none"
              />

              {/* Skeleton UI (Mock Resume) */}
              <div className="relative z-10 flex items-center gap-4 border-b border-border/50 pb-6">
                <div className="w-16 h-16 rounded-full bg-muted shadow-inner" />
                <div className="space-y-2">
                  <div className="w-32 h-4 rounded bg-foreground/80" />
                  <div className="w-24 h-3 rounded bg-muted-foreground/50" />
                </div>
              </div>
              <div className="relative z-10 space-y-3">
                <div className="w-20 h-3 rounded bg-primary/60 mb-2" />
                <div className="w-full h-2 rounded bg-muted" />
                <div className="w-5/6 h-2 rounded bg-muted" />
                <div className="w-4/6 h-2 rounded bg-muted" />
              </div>
              <div className="relative z-10 space-y-3 mt-4">
                <div className="w-24 h-3 rounded bg-primary/60 mb-2" />
                <div className="w-full h-12 rounded bg-muted/50 border border-border/50 p-3 flex flex-col gap-2 shadow-sm">
                  <div className="w-3/4 h-2 rounded bg-muted-foreground/40" />
                  <div className="w-1/2 h-2 rounded bg-muted-foreground/40" />
                </div>
                <div className="w-full h-12 rounded bg-muted/50 border border-border/50 p-3 flex flex-col gap-2 shadow-sm">
                  <div className="w-5/6 h-2 rounded bg-muted-foreground/40" />
                  <div className="w-2/3 h-2 rounded bg-muted-foreground/40" />
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </header>

      {/* DETAILED FEATURES SECTION */}
      <section className="relative z-10 bg-muted/30 border-y border-border py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We separate your professional data from the document layout. You provide the raw facts, and our AI pipeline handles the rest.
            </p>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Step 1 */}
            <motion.div variants={fadeUp} className="bg-background p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Build Your Database</h3>
              <p className="text-muted-foreground leading-relaxed">
                Enter your work experience, projects, and skills into our PostgreSQL-backed dashboard once. It acts as your permanent professional source of truth.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeUp} className="bg-background p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">2. AI Tailoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Paste the job description you want to apply for. Our Groq-powered LLM analyzes it and rewrites your bullets to perfectly match the target keywords and intent.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeUp} className="bg-background p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Typst Compilation</h3>
              <p className="text-muted-foreground leading-relaxed">
                The tailored JSON data is fed into our server-side Typst compiler, instantly generating a beautiful, 100% text-selectable PDF that ATS systems love.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-background border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-black tracking-tighter flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs">
                  <Terminal size={12} />
                </div>
                ResuForge
              </div>
              <p className="text-muted-foreground max-w-sm mb-6">
                The developer-first resume builder. Engineered with Next.js 15, Drizzle ORM, and Typst for unmatched performance and precision.
              </p>
            </div>

            {/* Links Column 1 */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">ATS Guidelines</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Typst Templates</Link></li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Account</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ResuForge. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
}