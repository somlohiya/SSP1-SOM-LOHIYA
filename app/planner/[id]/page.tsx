'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Download, 
  Edit3, 
  Brain, 
  Activity, 
  CalendarCheck, 
  Calendar, 
  List, 
  GitCommit, 
  Sparkles, 
  Timer, 
  Target,
  MoreVertical
} from 'lucide-react';
import { studyPlanAPI } from '@/lib/api';

interface StudyPlan {
  _id: string;
  title: string;
  description: string;
  status: string;
  sessions: any[];
  completedSessions: number;
  totalSessions: number;
  dailyHours: number;
  learningStyle: string;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function PlannerDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline'>('list');

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await studyPlanAPI.getOne(planId);
        setPlan(data);
      } catch (error) {
        console.error('Error loading plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId]);

  const handleCompleteSession = async (sessionId: string) => {
    if (!plan) return;
    try {
      const updated = await studyPlanAPI.completeSession(planId, sessionId);
      setPlan(updated.studyPlan);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-indigo-400 font-medium">Loading Study Plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center gap-4">
        <Target className="w-16 h-16 text-slate-600" />
        <p className="text-xl font-bold">Plan not found</p>
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">Return to Dashboard</Link>
      </div>
    );
  }

  const progress = plan.totalSessions > 0 ? (plan.completedSessions / plan.totalSessions) * 100 : 0;
  const isCompleted = progress === 100;

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 selection:bg-indigo-500/30 pb-20 relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-xs font-bold text-indigo-400 transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit Plan
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        
        {/* Header Section: Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden mb-8 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex gap-6 items-center md:items-start">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-1 shrink-0 shadow-2xl shadow-indigo-500/20">
                <div className="w-full h-full bg-[#131825] rounded-xl flex items-center justify-center">
                  <CalendarCheck className="w-10 h-10 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {plan.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {plan.totalSessions} Sessions
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {plan.title}
                </h1>
                <p className="text-slate-400 max-w-xl">
                  {plan.description || "Your personalized AI study schedule."}
                </p>
              </div>
            </div>

            {/* Premium Progress Indicator */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 w-full md:w-64 shrink-0">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completion</span>
                <span className="text-2xl font-extrabold text-white">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
              <p className="text-xs text-slate-400 text-right font-medium">
                {plan.completedSessions} of {plan.totalSessions} completed
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition group">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Clock className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Daily Goal</span>
            </div>
            <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{plan.dailyHours}h</p>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition group">
            <div className="flex items-center gap-2 text-fuchsia-400 mb-2">
              <Brain className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Style</span>
            </div>
            <p className="text-lg font-bold text-white capitalize group-hover:scale-105 transition-transform origin-left">{plan.learningStyle}</p>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition group">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Activity className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Remaining</span>
            </div>
            <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{plan.totalSessions - plan.completedSessions}</p>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition group">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle2 className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Status</span>
            </div>
            <p className="text-lg font-bold text-white capitalize group-hover:scale-105 transition-transform origin-left">{isCompleted ? 'Finished' : 'On Track'}</p>
          </motion.div>
        </motion.div>

        {/* View Controls & Schedule Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" /> Study Schedule
          </h2>
          
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl w-fit">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <List className="w-4 h-4" /> List
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Calendar className="w-4 h-4" /> Calendar
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'timeline' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <GitCommit className="w-4 h-4" /> Timeline
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={stagger}
          className="space-y-4"
        >
          {plan.sessions.map((session, idx) => {
            const isCompletedSession = session.completed;
            return (
              <motion.div
                key={session._id || session.id || idx}
                variants={fadeUp}
                className={`group relative overflow-hidden bg-white/5 border rounded-2xl p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isCompletedSession
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-white/10 hover:border-indigo-500/50'
                }`}
              >
                {/* Glow effect for upcoming hover */}
                {!isCompletedSession && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                <div className="flex items-start gap-4 relative z-10">
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isCompletedSession ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:border-indigo-400'
                  }`}>
                    {isCompletedSession ? <CheckCircle2 className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        isCompletedSession ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                      }`}>
                        {isCompletedSession ? 'Completed' : 'Scheduled'}
                      </span>
                      <h3 className={`text-lg font-bold ${isCompletedSession ? 'text-emerald-50 line-through opacity-70' : 'text-white'}`}>
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-slate-300 mb-2">
                      <span className="text-slate-500 mr-2">Topics:</span> 
                      {session.topics.join(', ')}
                    </p>
                    {isCompletedSession && session.completedAt && (
                      <p className="text-xs font-bold text-emerald-500/70">
                        Finished on {new Date(session.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto relative z-10">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center md:justify-end gap-1">
                      <Clock className="w-3 h-3" /> Time Block
                    </p>
                    <p className="text-white font-medium bg-black/30 px-3 py-1 rounded-lg text-sm border border-white/5">
                      {session.startTime} - {session.endTime}
                    </p>
                  </div>
                  
                  {!isCompletedSession ? (
                    <button
                      onClick={() => handleCompleteSession(session._id || session.id)}
                      className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Done
                    </button>
                  ) : (
                    <button className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 flex items-center justify-center transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {plan.sessions.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No sessions planned</h3>
            <p className="text-slate-400">Generate a new AI study plan to see your sessions here.</p>
          </div>
        )}

      </div>
    </main>
  );
}
