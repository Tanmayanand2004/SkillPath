"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BookOpen, Flame, Map, ArrowRight, Compass, Trophy,
  TrendingUp, Clock, ChevronRight, Plus, BarChart3, Brain, User,
  LogOut, Settings, Star, MessageSquare
} from 'lucide-react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface PathCard {
  id: string;
  title: string;
  topic: string;
  created_at: string;
  total_milestones: number;
  completed_milestones: number;
  progress_pct: number;
}

interface Stats {
  total_paths: number;
  total_completed_milestones: number;
  streak: number;
  member_since: string;
}

function ProgressRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e22" strokeWidth={5} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={pct === 100 ? '#10b981' : '#6366f1'}
        strokeWidth={5}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - filled }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { token, user, logout, loading: authLoading, getToken } = useAuth();
  const [paths, setPaths] = useState<PathCard[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !getToken()) {
      router.push('/login');
    }
  }, [authLoading]);

  useEffect(() => {
    const authToken = getToken();
    if (!authToken) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [pathsRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/paths/', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }),
          fetch('http://localhost:5000/api/paths/stats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
        ]);
        if (pathsRes.status === 401 || statsRes.status === 401) {
          logout();
          return;
        }

        const pathsData = await pathsRes.json();
        const statsData = await statsRes.json();
        if (pathsData.success) setPaths(pathsData.paths || []);
        if (statsData.success) setStats(statsData.stats);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (authLoading || (!token && !authLoading)) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = user?.full_name || user?.username || 'Learner';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-indigo-500/30">
      {/* Background Orbs */}
      <div className="fixed top-0 inset-x-0 h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-purple-600/8 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Skill<span className="text-indigo-400">Path</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/quiz"
                className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                <Brain className="w-4 h-4" />
                Skill Quiz
              </Link>
              <Link
                href="/chat"
                className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                <MessageSquare className="w-4 h-4" />
                AI Chat
              </Link>
              <Link
                href="/generator"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded-full transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Path
              </Link>

              {/* User avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white hover:opacity-90 transition-opacity"
                >
                  {user?.profile_pic_url
                    ? <img src={user.profile_pic_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    : initials
                  }
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-56 bg-[#18181B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-slate-500 text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">{displayName} 👋</h1>
          {stats && (
            <p className="text-slate-400 mt-2 text-sm">
              Member since {stats.member_since} · {stats.total_completed_milestones} milestones completed
            </p>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: 'Active Paths',
              value: loading ? '—' : stats?.total_paths ?? 0,
              icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
              color: 'bg-indigo-500/10',
            },
            {
              label: 'Milestones Done',
              value: loading ? '—' : stats?.total_completed_milestones ?? 0,
              icon: <Trophy className="w-5 h-5 text-amber-400" />,
              color: 'bg-amber-500/10',
            },
            {
              label: 'Day Streak',
              value: loading ? '—' : (stats?.streak ?? 0) === 0 ? '0' : `${stats?.streak}`,
              icon: <Flame className="w-5 h-5 text-orange-400" />,
              color: 'bg-orange-500/10',
              suffix: stats?.streak && stats.streak > 0 ? ' 🔥' : '',
            },
            {
              label: 'Avg. Progress',
              value: loading ? '—' : paths.length > 0
                ? `${Math.round(paths.reduce((a, p) => a + p.progress_pct, 0) / paths.length)}%`
                : '0%',
              icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
              color: 'bg-emerald-500/10',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#121214] border border-white/5 p-5 rounded-2xl"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-extrabold text-white">
                {stat.value}{stat.suffix || ''}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Paths Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Your Learning Paths</h2>
          {paths.length > 0 && (
            <Link href="/generator" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              <Plus className="w-4 h-4" /> New Path
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : paths.length === 0 ? (
          /* EMPTY STATE — immersive onboarding */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-8 bg-gradient-to-br from-[#121214] to-[#0e0e10] border border-white/5 rounded-3xl relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-indigo-600/5 blur-[80px] rounded-full" />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                <Compass className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-extrabold mb-3">Your journey starts here</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                You haven't generated a learning path yet. Take a quick skill quiz to let AI calibrate your level, then generate your personalized roadmap in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/quiz"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-full transition-all hover:scale-105"
                >
                  <Brain className="w-5 h-5" /> Take Skill Quiz First
                </Link>
                <Link
                  href="/generator"
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-full transition-colors"
                >
                  <Map className="w-5 h-5" /> Skip & Build Path
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paths.map((path, i) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Link href={`/path/${path.id}`} className="block h-full">
                  <div className={`h-full bg-[#121214] border rounded-2xl p-6 transition-all duration-300 ${
                    path.progress_pct === 100
                      ? 'border-emerald-500/30 hover:border-emerald-500/50'
                      : 'border-white/5 hover:border-indigo-500/30'
                  }`}>
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-3">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          path.progress_pct === 100
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {path.topic}
                        </span>
                        <h3 className="font-bold text-base text-white mt-2 leading-snug line-clamp-2">
                          {path.title}
                        </h3>
                      </div>
                      <div className="shrink-0 relative">
                        <ProgressRing pct={path.progress_pct} size={48} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {path.progress_pct}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className={`h-full rounded-full ${path.progress_pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${path.progress_pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.07 }}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {path.completed_milestones}/{path.total_milestones} milestones
                      </span>
                      <span className={`text-xs flex items-center gap-1 transition-colors ${
                        path.progress_pct === 100 ? 'text-emerald-400' : 'text-slate-600 group-hover:text-indigo-400'
                      }`}>
                        {path.progress_pct === 100 ? '✅ Complete' : 'Continue'} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Add new path card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: paths.length * 0.07 }}
              whileHover={{ y: -4 }}
            >
              <Link href="/generator" className="block h-full">
                <div className="h-full min-h-[160px] bg-[#121214] border border-dashed border-white/10 hover:border-indigo-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
                    <Plus className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Generate New Path</p>
                </div>
              </Link>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

