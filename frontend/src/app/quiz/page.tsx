"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, XCircle, Brain, ChevronRight, 
  Trophy, Loader2, RefreshCcw, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizState {
  questions: Question[];
  currentQ: number;
  answers: Record<number, number>; // question id -> selected option index
  submitted: boolean;
  score: number;
  level: string;
  levelLabel: string;
  message: string;
  topic: string;
}

export default function SkillQuiz() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const fetchQuiz = async () => {
    if (!topic.trim()) return;
    setLoadingQuiz(true);
    setError('');
    setQuiz(null);

    try {
      const res = await fetch('http://localhost:5000/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (data.success && data.quiz?.questions?.length > 0) {
        setQuiz({
          questions: data.quiz.questions,
          currentQ: 0,
          answers: {},
          submitted: false,
          score: 0,
          level: '',
          levelLabel: '',
          message: '',
          topic: data.topic
        });
      } else {
        setError('Failed to generate quiz. Please try again.');
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const selectOption = (index: number) => {
    if (!quiz || showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!quiz || selectedOption === null) return;
    const q = quiz.questions[quiz.currentQ];
    const updatedAnswers = { ...quiz.answers, [q.id]: selectedOption };
    const isLast = quiz.currentQ === quiz.questions.length - 1;

    if (isLast) {
      evaluateQuiz(updatedAnswers);
    } else {
      setQuiz({ ...quiz, currentQ: quiz.currentQ + 1, answers: updatedAnswers });
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const evaluateQuiz = async (answers: Record<number, number>) => {
    if (!quiz) return;
    setEvaluating(true);

    const answerPayload = quiz.questions.map(q => ({
      question_id: q.id,
      selected: answers[q.id] ?? -1,
      correct: q.correct
    }));

    try {
      const res = await fetch('http://localhost:5000/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerPayload, topic: quiz.topic })
      });
      const data = await res.json();
      setQuiz({
        ...quiz,
        answers,
        submitted: true,
        score: data.score,
        level: data.recommended_level,
        levelLabel: data.recommended_level_label,
        message: data.message
      });
    } catch {
      setError('Failed to evaluate quiz.');
    } finally {
      setEvaluating(false);
    }
  };

  const goToGenerator = () => {
    if (!quiz) return;
    const params = new URLSearchParams({
      topic: quiz.topic,
      expertise_level: quiz.level,
      from_quiz: 'true'
    });
    router.push(`/generator?${params.toString()}`);
  };

  // ─── UI States ────────────────────────────────────────────────────────────

  // Step 1: Topic entry
  if (!quiz && !loadingQuiz) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
        <div className="absolute top-0 inset-x-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute top-[20%] right-[5%] w-[40%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-extrabold mb-2">Skill Gap Quiz</h1>
            <p className="text-slate-400">
              5 quick questions to measure your actual skill level. We'll auto-tune your learning path based on your results.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="bg-white/3 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <label className="block text-sm font-medium text-slate-300 mb-2">What do you want to learn?</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuiz()}
              placeholder="e.g. Machine Learning, React, Data Structures..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 mb-4 transition-colors"
            />
            <button
              onClick={fetchQuiz}
              disabled={!topic.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Brain className="w-5 h-5" />
              Start Skill Assessment
            </button>

            <div className="mt-4 flex justify-center">
              <Link href="/generator" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                Skip quiz → Build path manually
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {["5 Questions", "30 Seconds", "AI-Calibrated"].map((item) => (
              <div key={item} className="bg-white/3 border border-white/5 rounded-xl p-3">
                <p className="text-xs text-slate-400">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading quiz
  if (loadingQuiz) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Generating your assessment...</p>
          <p className="text-slate-500 text-sm mt-1">Crafting questions for <span className="text-indigo-400">{topic}</span></p>
        </div>
      </div>
    );
  }

  // Results
  if (quiz?.submitted) {
    const levelColors: Record<string, string> = {
      beginner: 'from-blue-500 to-indigo-500',
      intermediate: 'from-indigo-500 to-purple-500',
      advanced: 'from-purple-500 to-pink-500'
    };

    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className={`bg-gradient-to-br ${levelColors[quiz.level] || 'from-indigo-500 to-purple-500'} p-px rounded-2xl`}>
            <div className="bg-[#0e0e10] rounded-2xl p-8 text-center">
              <Trophy className="w-14 h-14 mx-auto mb-4 text-amber-400" />
              <div className="text-4xl font-black mb-2">{quiz.score}/{quiz.questions.length}</div>
              <div className={`text-xl font-bold bg-gradient-to-r ${levelColors[quiz.level] || 'from-indigo-400 to-purple-400'} bg-clip-text text-transparent mb-3`}>
                {quiz.levelLabel}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{quiz.message}</p>

              <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                {quiz.questions.map((q, i) => {
                  const userAnswer = quiz.answers[q.id];
                  const isCorrect = userAnswer === q.correct;
                  return (
                    <div key={i} className={`rounded-xl p-3 border ${
                      isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      {isCorrect
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                        : <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                      }
                      <p className="text-xs text-slate-400 mt-1">Q{i + 1}</p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={goToGenerator}
                className={`w-full bg-gradient-to-r ${levelColors[quiz.level] || 'from-indigo-500 to-purple-500'} text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
              >
                <Sparkles className="w-5 h-5" />
                Build My {quiz.levelLabel} Path
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setQuiz(null); setTopic(''); }}
                className="w-full mt-3 text-slate-500 hover:text-slate-300 text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Try again with different topic
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active quiz
  if (quiz) {
    const q = quiz.questions[quiz.currentQ];
    const progress = ((quiz.currentQ) / quiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Question {quiz.currentQ + 1} of {quiz.questions.length}</span>
              <span>{quiz.topic}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={quiz.currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/3 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-white mb-6 leading-relaxed">{q.question}</h2>

              <div className="space-y-3 mb-6">
                {q.options.map((option, i) => {
                  let style = 'border-white/10 hover:border-indigo-500/40 bg-white/3 hover:bg-white/5 text-slate-300';
                  if (showExplanation) {
                    if (i === q.correct) style = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
                    else if (i === selectedOption && i !== q.correct) style = 'border-red-500/50 bg-red-500/10 text-red-300';
                    else style = 'border-white/5 bg-white/2 text-slate-500 opacity-50';
                  } else if (i === selectedOption) {
                    style = 'border-indigo-500 bg-indigo-500/10 text-white';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => selectOption(i)}
                      disabled={showExplanation}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${style} flex items-center justify-between group`}
                    >
                      <span className="text-sm font-medium">{option}</span>
                      {showExplanation && i === q.correct && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {showExplanation && i === selectedOption && i !== q.correct && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && q.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20"
                  >
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Explanation</p>
                    <p className="text-sm text-slate-300">{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={nextQuestion}
                disabled={selectedOption === null || evaluating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
              >
                {evaluating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                ) : quiz.currentQ === quiz.questions.length - 1 ? (
                  <><Trophy className="w-4 h-4" /> See My Results</>
                ) : (
                  <>Next Question <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return null;
}

