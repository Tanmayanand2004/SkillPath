"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ArrowLeft, Bot, User as UserIcon, Loader2, MessageSquare, Trash2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "What skill is most in demand right now?",
  "How do I become a machine learning engineer?",
  "Suggest a 3-month Python roadmap for beginners",
  "What's the difference between frontend and backend?",
  "Which programming language should I learn first?",
];

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatPage() {
  const router = useRouter();
  const { user, getToken, loading: authLoading, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!authLoading && !getToken()) router.push('/login');
  }, [authLoading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    const authToken = getToken();
    if (!authToken) { router.push('/login'); return; }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: messageText,
          conversation_id: conversationId,
          mode: 'General'
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server error. Check backend logs.');
      }

      const data = await res.json();

      if (res.status === 401) {
        logout();
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Session expired. Please [sign in again](/login).`,
          timestamp: new Date()
        }]);
        return;
      }

      if (data.success) {
        if (data.conversation_id && !conversationId) {
          setConversationId(data.conversation_id);
        }
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error || data.message || 'Failed to get response');
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${e.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const displayName = user?.full_name || user?.username || 'You';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0B] text-white flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-emerald-600/6 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 h-16 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">SkillPath AI</h1>
              <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {/* Welcome */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-indigo-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Hi {user?.full_name?.split(' ')[0] || user?.username || 'there'}! 👋</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
                I'm Atlas, your AI learning coach. Ask me anything about skills, careers, or learning paths.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-xl mx-auto text-left">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="p-3 rounded-xl bg-white/3 border border-white/8 hover:border-indigo-500/30 hover:bg-white/5 text-xs text-slate-300 text-left transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-br from-emerald-400 to-indigo-500'
              }`}>
                {msg.role === 'user'
                  ? initials
                  : <Sparkles className="w-4 h-4 text-white" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] relative group ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-[#18181B] border border-white/5 text-slate-200 rounded-tl-sm'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                {/* Copy button */}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1"
                  >
                    {copied === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied === msg.id ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 shrink-0 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#18181B] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end bg-[#18181B] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-indigo-500/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask me anything about learning, skills, or your career path..."
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none placeholder:text-slate-600 min-h-[24px] max-h-[120px] disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0"
            >
              {loading
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </div>
          <p className="text-xs text-slate-600 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}

