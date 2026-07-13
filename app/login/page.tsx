"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Terminal, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            // Parse response body
            const resData = await res.json();

            if (!res.ok) throw new Error(resData.error || "Invalid credentials");

            // --- CRITICAL FIX: STORE TO LOCALSTORAGE ---
            localStorage.setItem("accessToken", resData.accessToken);
            localStorage.setItem("user", JSON.stringify(resData.user));

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err) {
            setError("Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] -z-10" />

            <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
                <ThemeToggle />
            </nav>

            <main className="flex-1 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <div className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input name="email" type="email" required placeholder="john@example.com" className="w-full pl-10 py-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input name="password" type="password" required placeholder="••••••••" className="w-full pl-10 py-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>
                            <button disabled={isLoading} className="w-full py-2.5 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
                                {isLoading ? "Authenticating..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}