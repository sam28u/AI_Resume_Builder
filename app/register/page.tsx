"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Terminal, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Cast the target to HTMLFormElement to get type-safe access to form fields
        const form = e.currentTarget;
        const formData = new FormData(form);

        // This approach is much cleaner and avoids the deprecated warnings
        const body = Object.fromEntries(formData.entries());

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] -z-10" />

            <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full z-10">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
                <ThemeToggle />
            </nav>

            <main className="flex-1 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <div className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white mx-auto mb-4">
                                <Terminal size={24} />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Initialize Profile</h1>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input name="firstName" type="text" required placeholder="John" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input name="lastName" type="text" required placeholder="Doe" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>

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

                            <button disabled={isLoading} className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50">
                                {isLoading ? "Initializing..." : "Create Account"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}