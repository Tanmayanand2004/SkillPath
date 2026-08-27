"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Map, Target, Zap, LayoutDashboard, Search, Brain, TrendingUp, Users, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, token, loading: authLoading } = useAuth();
  const isLoggedIn = !authLoading && !!token;

  const features = [
    {
      title: "Skill Gap Quiz",
      description: "Answer 5 AI-generated questions and we'll measure your actual expertise level—no self-reporting guesswork.",
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      href: "/quiz",
      cta: "Take the Quiz →"
    },
    {
      title: "AI-Powered RAG",
      description: "Every resource link is validated post-generation. Broken URLs are auto-replaced with guaranteed Google search results.",
      icon: <Search className="w-6 h-6 text-emerald-400" />,
      href: "/generator",
      cta: null
    },
    {
      title: "Hyper-Personalized",
      description: "Paths tailored to your expertise, weekly time commitment, career goals, and even your preferred learning style.",
      icon: <Target className="w-6 h-6 text-indigo-400" />,
      href: "/generator",
      cta: null
    },
    {
      title: "Live Progress Tracking",
      description: "Check off milestones as you complete them. Progress is synced to your account and persists across devices.",
      icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
      href: "/dashboard",
      cta: null
    },
    {
      title: "Context-Aware AI Tutor",
      description: "Chat with an AI that knows your exact milestone, your progress, and your history—not a generic chatbot.",
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      href: "/generator",
      cta: null
    },
    {
      title: "Adaptive Curriculum",
      description: "Stuck on a milestone? Ask the tutor to adjust your path—it will simplify, extend, or pivot your roadmap in real time.",
      icon: <BookOpen className="w-6 h-6 text-rose-400" />,
      href: "/generator",
      cta: null
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Abstract Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] w-[40%] h-[30%] rounded-full bg-purple-600/8 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/5 bg-[#0A0A0B]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-xl font-bold tracking-tight text-white">
                Skill<span className="text-indigo-400 font-medium">Path</span>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              {isLoggedIn ? (
                <>
                  <Link href="/quiz" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                    Skill Quiz
                  </Link>
                  <Link href="/dashboard" className="text-sm font-medium bg-white text-black hover:bg-slate-200 transition-colors py-2.5 px-5 rounded-full flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" className="text-sm font-medium bg-white text-black hover:bg-slate-200 transition-colors py-2.5 px-5 rounded-full flex items-center gap-2">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>


      <main className="relative z-10">
        {/* Hero */}
        <section className="relative pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          
          {/* Subtle light effect behind hero text to separate it from the background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

          {/* Premium Tagline Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm flex items-center gap-3 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-slate-300 font-medium tracking-wide">A new standard for self-education</span>
          </motion.div>

          {/* Epic Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-8 leading-[1.1] relative z-10"
          >
            The smartest way <br className="hidden md:block" />
            to learn{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 drop-shadow-[0_0_30px_rgba(167,139,250,0.4)]">
              anything.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-slate-300 font-light mb-12 max-w-2xl leading-relaxed relative z-10"
          >
            Stop guessing your curriculum. SkillPath takes a quick AI-powered skill assessment,
            then generates a perfectly paced, milestone-driven roadmap with verified resources — built just for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row justify-center gap-5 w-full sm:w-auto relative z-10"
          >
            {isLoggedIn ? (
              <>
                <Link href="/quiz" className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-4 px-9 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(99,102,241,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-100" />
                  Take Skill Quiz
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/dashboard" className="bg-white/5 border border-white/10 text-white font-medium py-4 px-9 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md">
                  <LayoutDashboard className="w-5 h-5 text-slate-400" /> Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-4 px-9 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(99,102,241,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-100" />
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="bg-white/5 border border-white/10 text-white font-medium py-4 px-9 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md">
                  Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </motion.div>

        </section>

        {/* Removed Live Metrics Bar entirely */}

        {/* Features Grid */}
        <section className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              {/* Cleaned up heading: font-bold instead of font-extrabold */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Why SkillPath is{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">different</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
                Most platforms recommend courses. SkillPath builds your entire curriculum from scratch, verifies every resource, and adapts as you learn.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.07 }}
                  className={`p-8 rounded-3xl bg-[#121214] border border-white/5 hover:border-white/10 transition-all group ${feature.cta ? 'hover:border-indigo-500/30' : ''}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  {/* Reduced heading weight from font-bold to font-semibold */}
                  <h3 className="text-xl font-semibold mb-3 text-white tracking-tight">{feature.title}</h3>
                  <p className="text-slate-400 text-base leading-relaxed font-light mb-5">{feature.description}</p>
                  {feature.cta && (
                    <Link href={feature.href} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group-hover:underline">
                      {feature.cta}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-white/10 rounded-[2.5rem] p-12 md:p-16">
            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-6" />
            {/* Cleaned up heading weight */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ready to master something new?</h2>
            <p className="text-slate-300 font-light mb-10 text-lg">Take the 30-second skill quiz and get a personalized AI learning path in under a minute.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-4 px-10 rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <Brain className="w-5 h-5" /> Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm font-light">
        <p>Built with ❤️</p>
      </footer>
    </div>
  );
}
