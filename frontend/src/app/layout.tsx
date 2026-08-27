import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SkillPath — AI Learning Path Generator",
  description: "Stop guessing your curriculum. SkillPath generates a perfectly paced, AI-guided roadmap with verified resources — built just for you.",
  keywords: ["AI learning", "personalized education", "learning path", "skill development"],
  openGraph: {
    title: "SkillPath — AI Learning Path Generator",
    description: "Generate your personalized AI learning roadmap in seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0A0A0B] text-white font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

