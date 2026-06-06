'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, ArrowLeft, Brain, Calendar, Target, Clock, Sparkles, Zap, History } from 'lucide-react';
import { revisionAPI, courseAPI } from '@/lib/api';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const stagger: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function RevisionPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  useEffect(() => {
    courseAPI.getAll().then(setCourses).catch(console.error);
  }, []);

  const loadSchedules = async (courseId: string) => {
    setActiveCourseId(courseId);
    try {
      const data = await revisionAPI.getByCourse(courseId);
      setSchedules(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !topic) return;
    setLoading(true);
    try {
      await revisionAPI.generate(selectedCourse, topic);
      loadSchedules(selectedCourse);
      setTopic(''); // clear after success
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 md:p-8 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <nav className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 w-fit transition text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </nav>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-600 p-0.5">
            <div className="w-full h-full bg-[#131825] rounded-[14px] flex items-center justify-center">
              <RefreshCcw className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">Smart Revision Engine</h1>
            <p className="text-slate-400 font-medium">AI-powered spaced repetition schedules based on your weak points.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Target Course</label>
                  <select 
                    value={selectedCourse} 
                    onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      if (e.target.value) loadSchedules(e.target.value);
                    }}
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
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Topic to Review</label>
                  <input 
                    type="text" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Chemical Bonding"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm placeholder:text-slate-600"
                    required
                  />
                </div>
                <button disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 mt-4">
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing Graph...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Generate AI Schedule</>
                  )}
                </button>
              </form>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-indigo-400" /> Smart Logic Algorithm</h3>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0"><Target className="w-4 h-4" /></div>
                  <p>Prioritizes weak topics automatically using <span className="font-bold text-white">Spaced Repetition</span>.</p>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0"><Zap className="w-4 h-4" /></div>
                  <p>Extracts highly probable <span className="font-bold text-white">exam questions</span> from uploaded syllabi.</p>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 shrink-0"><History className="w-4 h-4" /></div>
                  <p>Generates dynamic <span className="font-bold text-white">flashcards</span> daily to reinforce long-term memory.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!activeCourseId ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[500px] bg-white/5 border border-white/10 border-dashed rounded-3xl p-12 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <Calendar className="w-10 h-10 text-indigo-500/50" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">Select a Course</h3>
                  <p className="text-slate-500 max-w-sm">Choose a course from the panel to view your personalized revision schedules or generate new ones.</p>
                </motion.div>
              ) : schedules.length > 0 ? (
                <motion.div key="list" variants={stagger} initial="hidden" animate="show" className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-400"/> Active Revision Tracks</h2>
                    <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">{schedules.length} Schedules</span>
                  </div>
                  
                  {schedules.map((schedule, i) => (
                    <motion.div variants={fadeUp} key={schedule._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors backdrop-blur-xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-white text-xl mb-2">{schedule.topic}</h3>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {schedule.totalCards} Flashcards
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                                {schedule.algorithm.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Target className="w-3 h-3 text-emerald-400" /> Mastery</p>
                            <p className="text-2xl font-extrabold text-white">{Math.round((schedule.masteredCards / Math.max(1, schedule.totalCards)) * 100)}%</p>
                          </div>
                          <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><History className="w-3 h-3 text-amber-400" /> Reviews</p>
                            <p className="text-2xl font-extrabold text-white">{schedule.totalCards - schedule.masteredCards}</p>
                          </div>
                        </div>
                        
                        <Link href={`/course/${schedule.courseId}`} className="block">
                          <button className="w-full py-3.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 shadow-lg">
                            Start Revision Session <ArrowLeft className="w-4 h-4 rotate-180" />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="no-schedules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[500px] bg-white/5 border border-white/10 border-dashed rounded-3xl p-12 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-amber-500/50" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">No Active Tracks</h3>
                  <p className="text-slate-500 max-w-sm">You haven't generated any revision schedules for this course yet. Use the panel on the left to start.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
