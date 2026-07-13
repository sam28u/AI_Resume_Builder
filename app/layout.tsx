import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Make sure this path is correct
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResuForge | AI-Powered ATS Resumes",
  description: "Engineered with Next.js, Groq, and Typst.",
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}