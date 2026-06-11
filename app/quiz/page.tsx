'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, CheckCircle2, XCircle, Sparkles, RefreshCcw, Target, Settings2 } from 'lucide-react';
import { quizAPI, courseAPI } from '@/lib/api';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const stagger: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function QuizPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    courseAPI.getAll().then(setCourses).catch(console.error);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !topic) return;
    setLoading(true);
    setError('');
    try {
      const generated = await quizAPI.generate(selectedCourse, topic, difficulty, numQuestions);
      setQuiz(generated);
      setAnswers({});
      setSubmitted(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate quiz. Ensure GEMINI_API_KEY is set in server/.env.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    let correct = 0;
    quiz.questions.forEach((q: any, i: number) => {
      // For short answers, we'd ideally use AI grading, but string match for now
      if (answers[i]?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim()) {
        correct++;
      } else if (q.type !== 'short' && answers[i] === q.correctAnswer) {
        correct++;
      }
    });
    const finalScore = Math.round((correct / quiz.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    
    try {
      await quizAPI.submit(quiz._id, finalScore);
    } catch (err) {
      console.error(err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 md:p-8 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <nav className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 w-fit transition text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </nav>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-600 p-0.5">
            <div className="w-full h-full bg-[#131825] rounded-[14px] flex items-center justify-center">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">AI Quiz Generator</h1>
            <p className="text-slate-400 font-medium">Test your knowledge with hyper-personalized assessments.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-4">
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Quiz Parameters</h2>
              </div>
              
              <form onSubmit={handleGenerate} className="space-y-5">
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Target Course</label>
                  <select 
                    value={selectedCourse} 
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    required
                  >
                    <option value="">Select a course...</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Study Topic</label>
                  <input 
                    type="text" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis, Newton's Laws"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm placeholder:text-slate-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Difficulty</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Questions</label>
                    <select 
                      value={numQuestions} 
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    >
                      <option value="5">5 Qs</option>
                      <option value="10">10 Qs</option>
                      <option value="20">20 Qs</option>
                    </select>
                  </div>
                </div>

                <button disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 mt-4">
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Synthesizing Quiz...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Generate Assessment</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[600px] bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full animate-spin border-t-indigo-500" />
                    <Brain className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-3 text-center w-full max-w-md">
                    <div className="h-4 bg-white/10 rounded-full w-3/4 mx-auto animate-pulse" />
                    <div className="h-4 bg-white/10 rounded-full w-1/2 mx-auto animate-pulse" />
                  </div>
                  <p className="text-indigo-400 font-medium animate-pulse">Crafting complex scenarios & distractors...</p>
                </motion.div>
              )}

              {!loading && !quiz && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[600px] bg-white/5 border border-white/10 border-dashed rounded-3xl p-12 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-10 h-10 text-indigo-500/50" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">Ready for Assessment</h3>
                  <p className="text-slate-500 max-w-sm">Select your parameters on the left to instantly generate a custom quiz powered by Gemini AI.</p>
                </motion.div>
              )}

              {!loading && quiz && (
                <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* Quiz Header */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{quiz.topic} Assessment</h2>
                        <div className="flex items-center gap-3 text-sm font-medium">
                          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">{quiz.questions.length} Questions</span>
                          <span className="px-3 py-1 bg-white/5 text-slate-300 rounded-full">{difficulty} Difficulty</span>
                        </div>
                      </div>
                      
                      {submitted && (
                        <div className={`px-6 py-4 rounded-2xl border flex flex-col items-center ${getScoreColor(score)}`}>
                          <span className="text-sm font-bold uppercase tracking-wider mb-1 opacity-80">Final Score</span>
                          <span className="text-4xl font-extrabold">{score}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {quiz.questions.map((q: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                            {i+1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white text-lg mb-6 leading-relaxed">{q.question}</p>
                            
                            {q.type === 'mcq' || q.type === 'tf' ? (
                              <div className="grid gap-3">
                                {q.options.map((opt: string) => (
                                  <label key={opt} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                    answers[i] === opt 
                                      ? 'border-indigo-500 bg-indigo-500/20 text-white' 
                                      : 'border-white/5 bg-black/20 hover:border-white/20 text-slate-300'
                                    } ${
                                    submitted && opt === q.correctAnswer 
                                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-[#0B0F19]' 
                                      : ''
                                    } ${
                                    submitted && answers[i] === opt && opt !== q.correctAnswer
                                      ? 'border-red-500 bg-red-500/20 text-red-200'
                                      : ''
                                  }`}>
                                    <input type="radio" name={`q-${i}`} value={opt} checked={answers[i] === opt} onChange={() => setAnswers({...answers, [i]: opt})} disabled={submitted} className="hidden" />
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                      submitted && opt === q.correctAnswer ? 'border-emerald-400 bg-emerald-400' :
                                      submitted && answers[i] === opt && opt !== q.correctAnswer ? 'border-red-400 bg-red-400' :
                                      answers[i] === opt ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'
                                    }`}>
                                      {answers[i] === opt && !submitted && <div className="w-2 h-2 rounded-full bg-white" />}
                                      {submitted && opt === q.correctAnswer && <CheckCircle2 className="w-4 h-4 text-[#0B0F19]" />}
                                      {submitted && answers[i] === opt && opt !== q.correctAnswer && <XCircle className="w-4 h-4 text-[#0B0F19]" />}
                                    </div>
                                    <span className="font-medium">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <textarea 
                                  value={answers[i] || ''} 
                                  onChange={(e) => setAnswers({...answers, [i]: e.target.value})} 
                                  disabled={submitted}
                                  placeholder="Type your answer here..."
                                  className={`w-full bg-black/40 border rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 min-h-[120px] transition-all ${
                                    submitted ? (
                                      answers[i]?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim() 
                                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                                        : 'border-red-500/50 bg-red-500/5'
                                    ) : 'border-white/10'
                                  }`}
                                />
                                {submitted && answers[i]?.toLowerCase().trim() !== q.correctAnswer?.toLowerCase().trim() && (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-200 text-sm">
                                    <span className="font-bold">Ideal Answer:</span> {q.correctAnswer}
                                  </div>
                                )}
                              </div>
                            )}

                            {submitted && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6">
                                <div className={`p-5 rounded-xl text-sm border ${answers[i] === q.correctAnswer || answers[i]?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim() ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200' : 'bg-red-500/5 border-red-500/20 text-red-200'}`}>
                                  <div className="flex items-center gap-2 mb-2 font-bold text-base">
                                    {answers[i] === q.correctAnswer || answers[i]?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim() ? <><Sparkles className="w-5 h-5 text-emerald-400" /> Excellent</> : <><Target className="w-5 h-5 text-red-400" /> Let's Review</>}
                                  </div>
                                  <p className="opacity-90 leading-relaxed text-slate-300">
                                    <span className="font-bold text-white">Explanation: </span> 
                                    {q.explanation}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {!submitted ? (
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSubmit} className="w-full mt-8 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition shadow-xl shadow-indigo-500/20">
                      Submit Assessment
                    </motion.button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                      <h3 className="text-3xl font-extrabold text-white mb-3">Assessment Complete!</h3>
                      <p className="text-slate-400 mb-8 max-w-lg mx-auto">Review your answers above. Your progress has been automatically saved to your course analytics.</p>
                      <button onClick={() => { setQuiz(null); window.scrollTo({top:0, behavior:'smooth'}); }} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 font-bold transition-all border border-indigo-500/30">
                        <RefreshCcw className="w-5 h-5" /> Generate Another Quiz
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
