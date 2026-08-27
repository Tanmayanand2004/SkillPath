"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Timer, Target, CheckCircle2, Brain, ArrowLeft, AlertTriangle, LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const EXPERTISE_LEVELS = [
  { id: 'beginner', label: 'Absolute Beginner', desc: 'No prior experience needed' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some foundational knowledge' },
  { id: 'advanced', label: 'Advanced', desc: 'Ready for expert concepts' }
];

const TIME_COMMITMENTS = [
  { id: 'minimal', label: 'Minimal', desc: '1–2 hours / week' },
  { id: 'moderate', label: 'Moderate', desc: '3–5 hours / week' },
  { id: 'substantial', label: 'Substantial', desc: '5–10 hours / week' },
  { id: 'intensive', label: 'Intensive', desc: '10+ hours / week' }
];

function GeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, getToken, loading: authLoading, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    topic: '',
    expertise_level: '',
    time_commitment: '',
    learning_style: 'visual'
  });

  // Pre-fill from quiz results
  useEffect(() => {
    const quizTopic = searchParams?.get('topic');
    const quizLevel = searchParams?.get('expertise_level');
    if (quizTopic || quizLevel) {
      setFormData(prev => ({
        ...prev,
        topic: quizTopic || prev.topic,
        expertise_level: quizLevel || prev.expertise_level,
      }));
      if (quizTopic) setStep(2);
    }
  }, [searchParams]);

  const generatePath = async () => {
    setError('');
    setLoading(true);

    // Always read token directly from localStorage to bypass hydration lag
    const authToken = getToken();

    if (!authToken) {
      setError('You must be signed in to generate a learning path.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/paths/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      // Check content-type before parsing JSON
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (status ${response.status}). Check backend logs.`);
      }

      const data = await response.json();

      if (response.status === 401) {
        logout();
        setError('Session expired. Please sign in again.');
        setLoading(false);
        return;
      }

      if (data.success && data.path && data.path.id) {
        router.push(`/path/${data.path.id}`);
      } else {
        setError(data.error || 'Path generation failed. Please try again.');
        setLoading(false);
      }
    } catch (e: any) {
      console.error('Generation error:', e);
      setError(e.message || 'Could not connect to backend. Make sure the server is running on port 5000.');
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Not logged in state
  if (!authLoading && !getToken()) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Sign in to generate paths</h2>
          <p className="text-slate-400 mb-6">Create a free account to generate AI-powered learning paths personalized for you.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6 selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      {/* Back link */}
      <Link href="/dashboard" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm z-10">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI Path Generator
          </div>
          <h1 className="text-2xl font-extrabold mb-1">Build Your Learning Path</h1>
          <p className="text-slate-400 text-sm">3 quick questions. Your personalized roadmap in seconds.</p>
        </div>

        {/* Step Progress */}
        <div className="mb-6 flex items-center gap-3">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step > num ? 'bg-indigo-500' : step === num ? 'bg-indigo-500/60' : 'bg-slate-800'}`} />
              <p className={`text-xs mt-1.5 font-medium transition-colors ${step === num ? 'text-white' : 'text-slate-600'}`}>
                {num === 1 ? 'Topic' : num === 2 ? 'Level' : 'Time'}
              </p>
            </div>
          ))}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300 font-medium">Generation Failed</p>
                <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
                {error.includes('signed in') && (
                  <Link href="/login" className="text-xs text-indigo-400 underline mt-1 block">Sign in here →</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 animate-ping absolute inset-0" />
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/30">
                    <BrainCircuit className="w-9 h-9 text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2">Architecting Your Journey</h2>
                <p className="text-slate-400 text-sm max-w-xs">
                  Our RAG pipeline is querying verified resources and building your personalized roadmap...
                </p>
                <div className="mt-6 flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold mb-1.5">What do you want to master?</h2>
                <p className="text-slate-400 text-sm mb-6">Be specific — the more detail, the better your path.</p>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning with Python, React Development, Data Structures..."
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && formData.topic.trim() && nextStep()}
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all text-base placeholder:text-slate-600"
                  autoFocus
                />
                <p className="text-xs text-slate-600 mt-2">Press Enter to continue</p>
              </motion.div>
            ) : step === 2 ? (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-1.5">Where are you currently at?</h2>
                <p className="text-slate-400 text-sm mb-6">We'll skip what you already know.</p>
                <div className="grid gap-3">
                  {EXPERTISE_LEVELS.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setFormData({ ...formData, expertise_level: level.id })}
                      className={`flex items-center gap-4 text-left px-5 py-4 rounded-xl border transition-all ${
                        formData.expertise_level === level.id
                          ? 'bg-indigo-500/10 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                          : 'bg-[#18181B] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        formData.expertise_level === level.id ? 'bg-indigo-500/20' : 'bg-white/5'
                      }`}>
                        {formData.expertise_level === level.id
                          ? <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                          : <span className="text-slate-500 text-sm font-bold">{level.id[0].toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{level.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{level.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                  <Timer className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold mb-1.5">How much time can you commit?</h2>
                <p className="text-slate-400 text-sm mb-6">Your schedule, your pace — we'll fit the curriculum to your life.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {TIME_COMMITMENTS.map(time => (
                    <button
                      key={time.id}
                      onClick={() => setFormData({ ...formData, time_commitment: time.id })}
                      className={`flex flex-col text-left px-5 py-4 rounded-xl border transition-all ${
                        formData.time_commitment === time.id
                          ? 'bg-indigo-500/10 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                          : 'bg-[#18181B] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <span className="font-semibold text-white text-sm mb-0.5">{time.label}</span>
                      <span className="text-xs text-slate-400">{time.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {!loading && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={prevStep}
              className={`px-5 py-2.5 rounded-full font-medium text-slate-400 hover:text-white transition-colors text-sm ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              ← Back
            </button>
            <button
              onClick={step === 3 ? generatePath : nextStep}
              disabled={
                (step === 1 && !formData.topic.trim()) ||
                (step === 2 && !formData.expertise_level) ||
                (step === 3 && !formData.time_commitment)
              }
              className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            >
              {step === 3 ? (
                <><Sparkles className="w-4 h-4" /> Generate My Path</>
              ) : (
                <>Continue <span className="text-base">→</span></>
              )}
            </button>
          </div>
        )}

        {/* Step indicator text */}
        {!loading && (
          <p className="text-center text-xs text-slate-600 mt-4">Step {step} of 3</p>
        )}
      </div>
    </div>
  );
}

export default function Generator() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <GeneratorContent />
    </Suspense>
  );
}

