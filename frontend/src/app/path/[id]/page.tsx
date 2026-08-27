"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MessageSquare, Send, CheckCircle2, Circle, ExternalLink, 
  Play, BookOpen, Clock, Trophy, ChevronDown, ChevronUp, Sparkles,
  AlertCircle, RotateCcw, TrendingUp, Lock
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── Animated Milestone Node ────────────────────────────────────────────────
function MilestoneNode({ 
  milestone, index, total, completed, onToggle, isExpanded, onExpand 
}: {
  milestone: any;
  index: number;
  total: number;
  completed: boolean;
  onToggle: () => void;
  isExpanded: boolean;
  onExpand: () => void;
}) {
  const isLast = index === total - 1;

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[1.70rem] top-14 w-0.5 h-full z-0">
          <motion.div
            className={`w-full ${completed ? 'bg-gradient-to-b from-emerald-400 to-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-gradient-to-b from-indigo-500 to-slate-700'}`}
            initial={{ height: 0 }}
            animate={{ height: completed ? "100%" : "40%" }}
            transition={{ duration: 0.8, delay: index * 0.15 }}
          />
          <div className="w-full h-full bg-slate-800 absolute top-0" style={{ zIndex: -1 }} />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex gap-4 pb-10"
      >
        {/* Node circle */}
        <div className="relative z-10 shrink-0">
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
              completed
                ? 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30'
                : 'bg-[#18181B] border-slate-600 hover:border-indigo-500'
            }`}
          >
            {completed 
              ? <CheckCircle2 className="w-7 h-7 text-white" />
              : <span className="text-lg font-bold text-slate-300">{index + 1}</span>
            }
          </motion.button>
          {completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -inset-1 rounded-full bg-emerald-500/20 -z-10"
            />
          )}
        </div>

        {/* Card */}
        <div className={`flex-1 rounded-2xl border transition-all ${
          completed 
            ? 'bg-emerald-500/5 border-emerald-500/20' 
            : 'bg-[#121214] border-white/5 hover:border-indigo-500/30'
        }`}>
          {/* Card Header */}
          <button onClick={onExpand} className="w-full text-left p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {milestone.type || `Phase ${index + 1}`}
                  </span>
                  {milestone.estimated_hours && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {milestone.estimated_hours}h
                    </span>
                  )}
                </div>
                <h3 className={`font-bold text-lg leading-tight transition-colors ${completed ? 'text-emerald-400/90' : 'text-white group-hover:text-indigo-300'}`}>
                  {milestone.title}
                </h3>
              </div>
              <div className={`shrink-0 transition-colors ${completed ? 'text-emerald-500/50' : 'text-slate-500'}`}>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
          </button>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-white/5 pt-4">
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {milestone.description}
                  </p>

                  {/* Skills gained */}
                  {milestone.skills_gained?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills You'll Gain</p>
                      <div className="flex flex-wrap gap-1.5">
                        {milestone.skills_gained.map((skill: string, i: number) => (
                          <span key={i} className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {milestone.resources?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Learning Resources</p>
                      <div className="space-y-2">
                        {milestone.resources.map((res: any, i: number) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 hover:border-indigo-500/30 transition-all group/link"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <BookOpen className="w-4 h-4 text-slate-500 group-hover/link:text-indigo-400 shrink-0" />
                              <span className="text-sm text-slate-300 truncate">{res.description || res.title || "Resource"}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {res.url_validated === false && (
                                <span title="Redirects to search results" className="text-xs text-amber-400/70">🔎</span>
                              )}
                              <ExternalLink className="w-4 h-4 text-slate-600 group-hover/link:text-indigo-400" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mark Complete / Undo */}
                  <button
                    onClick={onToggle}
                    className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                      completed
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-white/5'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {completed
                      ? <><RotateCcw className="w-4 h-4" /> Mark Incomplete</>
                      : <><CheckCircle2 className="w-4 h-4" /> Mark Complete</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PathViewer() {
  const params = useParams();
  const pathId = params?.id as string;
  const { token, user } = useAuth();

  const [pathData, setPathData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/paths/${pathId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success && data.path) {
          const pd = typeof data.path === 'string' ? JSON.parse(data.path) : data.path;
          setPathData(pd);
        }

        if (token) {
          const progRes = await fetch(`http://localhost:5000/api/progress/load/${pathId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const progData = await progRes.json();
          if (progData.success && progData.data) {
            const newSet = new Set<number>();
            Object.keys(progData.data).forEach(k => {
              if (progData.data[k] === 'completed') {
                newSet.add(parseInt(k, 10));
              }
            });
            setCompletedSet(newSet);
          }
        }
      } catch (e) {
        console.error("Failed to load path", e);
      } finally {
        setLoading(false);
      }
    };
    if (pathId) fetchPath();
  }, [pathId, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleComplete = async (index: number) => {
    const newSet = new Set(completedSet);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCompletedSet(newSet);

    // Persist progress
    if (token && pathId) {
      try {
        await fetch('http://localhost:5000/api/progress/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            path_id: pathId,
            milestone_identifier: String(index),
            status: newSet.has(index) ? 'completed' : 'not_started'
          })
        });
      } catch (e) { /* silently fail */ }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || chatLoading) return;
    const userMsg = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedMessages);
    setChatLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMsg,
          path_id: pathId,
          conversation_id: conversationId,
          mode: 'Path'
        })
      });
      const data = await res.json();
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
      setMessages([...updatedMessages, { role: 'assistant', content: data.reply || data.response || "I couldn't get a response. Try again!" }]);
    } catch {
      setMessages([...updatedMessages, { role: 'assistant', content: "Connection error. Please check that the backend is running." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const completedCount = completedSet.size;
  const totalCount = pathData?.milestones?.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your path...</p>
        </div>
      </div>
    );
  }

  if (!pathData) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-center p-8">
        <div>
          <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Path Not Found</h2>
          <p className="text-slate-400 mb-6">This learning path doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-500 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0B] text-white flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl flex items-center px-6 shrink-0 z-10 relative gap-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <div className="w-px h-5 bg-white/10" />
        <h1 className="text-sm font-semibold truncate flex-1">{pathData?.title || "Learning Path"}</h1>
        
        {/* Progress pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">{progressPct}%</span>
          </div>
          {progressPct === 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full"
            >
              <Trophy className="w-3.5 h-3.5" />
              Complete!
            </motion.div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Visual Roadmap */}
        <div className="w-full lg:w-[60%] xl:w-[58%] overflow-y-auto p-6 md:p-8 lg:p-10 border-r border-white/5 bg-[#0c0c0e]">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {pathData.expertise_level || 'All Levels'}
                </div>
                <div className="text-slate-500 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {pathData.time_commitment || 'Self-paced'}
                </div>
              </div>
              <h2 className="text-3xl font-extrabold mb-2">{pathData.topic}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{pathData.description || "Follow the milestones below at your own pace."}</p>

              {/* Completion stats */}
              <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  <span className="text-white font-bold text-lg">{completedCount}</span>
                  <span className="text-slate-500"> / {totalCount} milestones completed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {completedCount > 0 && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                  <span className={`font-bold ${progressPct === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {progressPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Milestone Roadmap */}
            <div>
              {pathData.milestones?.map((milestone: any, index: number) => (
                <MilestoneNode
                  key={index}
                  milestone={milestone}
                  index={index}
                  total={pathData.milestones.length}
                  completed={completedSet.has(index)}
                  onToggle={() => toggleComplete(index)}
                  isExpanded={expandedIndex === index}
                  onExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                />
              ))}
            </div>

            {/* Completion Banner */}
            <AnimatePresence>
              {progressPct === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 text-center"
                >
                  <Trophy className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-emerald-400 mb-1">Path Complete! 🎉</h3>
                  <p className="text-slate-400 text-sm">You've mastered all {totalCount} milestones. Ready for your next challenge?</p>
                  <Link href="/generator" className="inline-flex items-center gap-2 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    <Sparkles className="w-4 h-4" /> Start New Path
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: AI Tutor */}
        <div className="hidden lg:flex w-[40%] xl:w-[42%] flex-col bg-[#0A0A0B]">
          {/* Chat header */}
          <div className="p-5 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Atlas</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Online · Context Aware
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Welcome message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 shrink-0 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#18181B] border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-300 max-w-[85%]">
                Hi {user?.full_name || user?.username || "there"}! 👋 I'm Atlas, your AI guide for <strong className="text-white">{pathData?.topic}</strong>. Ask me to explain a concept, quiz you on the current milestone, or suggest extra resources!
              </div>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-emerald-400 to-indigo-500'
                }`}>
                  {msg.role === 'user' ? (user?.username?.[0]?.toUpperCase() || 'U') : <Sparkles className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className={`max-w-[85%] border border-white/5 rounded-2xl p-3.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm whitespace-pre-wrap'
                    : 'bg-[#18181B] text-slate-300 rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 shrink-0" />
                <div className="bg-[#18181B] border border-white/5 rounded-2xl rounded-tl-sm p-4">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 0 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {[
                  "Explain the first milestone",
                  "Quiz me on this topic",
                  "I'm stuck, help me"
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); }}
                    className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-slate-400 hover:text-white hover:border-indigo-500/40 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-[#0A0A0B] shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your tutor anything..."
                disabled={chatLoading}
                className="w-full bg-[#18181B] border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

