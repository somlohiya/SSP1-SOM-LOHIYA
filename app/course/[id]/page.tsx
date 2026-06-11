'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, TrendingUp, Brain, Target, Sparkles, Zap, MessageSquare, CheckCircle2, ChevronRight, Calendar, RefreshCcw, Loader2 } from 'lucide-react';
import { courseAPI } from '@/lib/api';

interface Topic {
  _id: string;    // MongoDB ObjectId — always present, used as the reliable key
  id?: string;    // Custom AI-generated field — may be undefined on older records
  name: string;
  description: string;
  estimatedHours: number;
  completed?: boolean;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  subject: string;
  topics: Topic[];
  totalEstimatedHours: number;
  progress: number;
  status: string;
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const stagger: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingTopicId, setTogglingTopicId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseData = await courseAPI.getOne(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  const handleToggleTopic = useCallback(async (topicId: string) => {
    console.log('Toggling topic:', topicId);
    if (!course || togglingTopicId || !topicId) return;
    setTogglingTopicId(topicId);

    // Optimistic update — toggle locally immediately
    const updatedTopics = course.topics.map(t =>
      (t._id || t.id) === topicId ? { ...t, completed: !t.completed } : t
    );
    const completedCount = updatedTopics.filter(t => t.completed).length;
    const newProgress = updatedTopics.length > 0
      ? Math.round((completedCount / updatedTopics.length) * 100)
      : 0;

    setCourse(prev => prev ? { ...prev, topics: updatedTopics, progress: newProgress } : prev);

    try {
      const result = await courseAPI.toggleTopicComplete(courseId, topicId);
      // Sync with server's authoritative state
      setCourse(result.course);
    } catch (error) {
      console.error('Error toggling topic completion:', error);
      // Revert optimistic update on failure
      setCourse(prev => prev ? { ...prev, topics: course.topics, progress: course.progress } : prev);
    } finally {
      setTogglingTopicId(null);
    }
  }, [course, courseId, togglingTopicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-indigo-400 font-medium">Loading Learning Environment...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex flex-col items-center justify-center gap-4">
        <Target className="w-16 h-16 text-slate-600" />
        <p className="text-xl font-bold">Course Not Found</p>
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">Return to Dashboard</Link>
      </div>
    );
  }

  const completedTopics = course.topics?.filter(t => t.completed)?.length || 0;
  const totalTopics = course.topics?.length || 0;
  const difficulty = course.totalEstimatedHours > 20 ? 'Advanced' : course.totalEstimatedHours > 10 ? 'Intermediate' : 'Beginner';
  const readinessScore = Math.min(Math.round(course.progress * 1.2), 100);

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000 pointer-events-none" />

      <div className="relative z-10">
        <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 w-fit transition text-sm font-bold uppercase tracking-wider">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Hero Section */}
          <motion.div initial="hidden" animate="show" variants={stagger} className="grid lg:grid-cols-12 gap-8 mb-12">

            {/* Course Identity */}
            <motion.div variants={fadeUp} className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-1 shrink-0 shadow-2xl shadow-indigo-500/20">
                  <div className="w-full h-full bg-[#131825] rounded-xl flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-indigo-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 uppercase tracking-wider">{course.subject}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 uppercase tracking-wider">{difficulty}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">{course.name}</h1>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{course.description || 'Master this subject with personalized AI guidance and dynamic study paths.'}</p>
                </div>
              </div>
            </motion.div>

            {/* AI Readiness & Progress Ring */}
            <motion.div variants={fadeUp} className="lg:col-span-4 bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
              <Sparkles className="absolute top-4 right-4 w-5 h-5 text-indigo-400/50" />
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-6 text-center">AI Readiness Score</h3>

              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/5" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * readinessScore) / 100} className="text-indigo-500 transition-all duration-700 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-white">{readinessScore}</span>
                  <span className="text-xs font-medium text-indigo-400">/ 100</span>
                </div>
              </div>
              <p className="text-center text-sm text-slate-400 mt-2">Predicted probability of mastering the exam based on current pace.</p>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <CheckCircle2 className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Topics</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{completedTopics} <span className="text-sm text-slate-500 font-medium">/ {totalTopics}</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Clock className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Time</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{course.totalEstimatedHours}h</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition">
                  <div className="flex items-center gap-2 text-fuchsia-400 mb-2">
                    <TrendingUp className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{course.progress}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Calendar className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">ETA</span>
                  </div>
                  <p className="text-lg font-bold text-white whitespace-nowrap">2 Weeks</p>
                </div>
              </div>

              {/* Topics Roadmap */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Target className="w-6 h-6 text-indigo-400" /> Learning Roadmap</h2>
                  <span className="text-xs text-slate-500 font-medium">Click a topic to mark as complete</span>
                </div>

                <div className="space-y-4">
                  {course.topics?.map((topic, index) => {
                    const currentId = topic._id || topic.id;
                    const isToggling = togglingTopicId === currentId;
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={currentId || index}
                        className={`group bg-white/5 border rounded-2xl p-6 backdrop-blur-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          topic.completed
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            topic.completed ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-600 bg-slate-800'
                          }`}>
                            {topic.completed && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className={`text-lg font-bold ${topic.completed ? 'text-emerald-300 line-through opacity-70' : 'text-white'}`}>{topic.name}</h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/40 text-slate-400 border border-white/5">
                                {topic.estimatedHours > 3 ? 'Hard' : 'Medium'}
                              </span>
                              {topic.completed && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Done
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-sm">{topic.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 pl-10 md:pl-0">
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Est. Time</p>
                            <p className="text-white font-medium">{topic.estimatedHours} Hours</p>
                          </div>
                          <button
                            onClick={() => handleToggleTopic(currentId as string)}
                            disabled={isToggling}
                            title={topic.completed ? 'Mark as incomplete' : 'Mark as complete'}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                              topic.completed
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400'
                                : 'bg-white/5 border-white/10 hover:bg-indigo-500 hover:border-indigo-500 hover:text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isToggling
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : topic.completed
                                ? <CheckCircle2 className="w-4 h-4" />
                                : <ChevronRight className="w-5 h-5" />
                            }
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {(!course.topics || course.topics.length === 0) && (
                    <div className="p-8 border border-dashed border-white/20 rounded-2xl text-center">
                      <p className="text-slate-400">No topics found. Start by generating a syllabus.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">

              {/* Quick Actions */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Quick Actions</h3>
                <div className="grid gap-3">
                  <Link href="/quiz" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-600/20 to-transparent hover:from-indigo-600/40 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition-all group">
                    <span className="font-bold">Generate Quiz</span>
                    <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                  <Link href="/notes" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-transparent hover:from-emerald-600/40 border border-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-all group">
                    <span className="font-bold">Generate Notes</span>
                    <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                  <Link href="/revision" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-600/20 to-transparent hover:from-amber-600/40 border border-amber-500/20 text-amber-300 hover:text-amber-200 transition-all group">
                    <span className="font-bold">Revision Cards</span>
                    <RefreshCcw className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                  <Link href="/chat" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-fuchsia-600/20 to-transparent hover:from-fuchsia-600/40 border border-fuchsia-500/20 text-fuchsia-300 hover:text-fuchsia-200 transition-all group">
                    <span className="font-bold">Ask AI Tutor</span>
                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* AI Insights Panel */}
              <div className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
                <Brain className="absolute -bottom-6 -right-6 w-32 h-32 text-indigo-500/10" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> AI Insights</h3>

                <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Strong Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {course.topics?.filter(t => t.completed).slice(0, 3).map(t => (
                        <span key={t._id} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg">{t.name}</span>
                      ))}
                      {completedTopics === 0 && (
                        <span className="text-slate-500 text-sm">Complete topics to see insights</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {course.topics?.filter(t => !t.completed).slice(0, 2).map(t => (
                        <span key={t._id} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium rounded-lg truncate max-w-full">{t.name}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Based on your syllabus complexity and estimated hours, focus on the <span className="text-white font-bold">{course.topics?.find(t => !t.completed)?.name || 'all topics — you are done!'}</span>. I recommend spending 2 hours daily.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
