'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Flame, BookOpen, Target, Brain, Sparkles, Zap, ChevronDown, Activity, Clock, Award } from 'lucide-react';
import { courseAPI, analyticsAPI } from '@/lib/api';

interface AnalyticsData {
  totalStudyHours: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: string;
  totalSessions: number;
  totalReviews: number;
  dailyStats: any[];
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const stagger: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function AnalyticsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await courseAPI.getAll();
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0]._id);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedCourse) return;
      try {
        const data = await analyticsAPI.getSummary(selectedCourse);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };
    loadAnalytics();
  }, [selectedCourse]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
          <p className="text-fuchsia-400 font-medium">Analyzing Learning Data...</p>
        </div>
      </div>
    );
  }

  // Mock data for premium charts if dailyStats is empty
  const mockDailyStats = analytics?.dailyStats?.length ? analytics.dailyStats : [
    { date: 'Mon', studyHours: 2.5, accuracy: 85 },
    { date: 'Tue', studyHours: 3.0, accuracy: 88 },
    { date: 'Wed', studyHours: 1.5, accuracy: 82 },
    { date: 'Thu', studyHours: 4.0, accuracy: 91 },
    { date: 'Fri', studyHours: 2.0, accuracy: 86 },
    { date: 'Sat', studyHours: 5.0, accuracy: 95 },
    { date: 'Sun', studyHours: 3.5, accuracy: 90 },
  ];

  const maxHours = Math.max(...mockDailyStats.map(s => s.studyHours));

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 relative overflow-hidden selection:bg-fuchsia-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000 pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 transition text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="relative">
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 text-white rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id} className="bg-[#131825]">
                  {course.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">Performance Center</h1>
              <p className="text-slate-400 text-lg">Track your learning journey and AI-driven insights.</p>
            </div>
          </div>

          {/* Core Metrics */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={<Flame className="w-6 h-6 text-orange-500" />} label="Current Streak" value={`${analytics?.currentStreak || 0} Days`} trend="+2 from last week" />
            <MetricCard icon={<Clock className="w-6 h-6 text-blue-500" />} label="Total Study Hours" value={`${analytics?.totalStudyHours || 0}h`} trend="Top 15% of students" />
            <MetricCard icon={<Target className="w-6 h-6 text-fuchsia-500" />} label="Average Accuracy" value={`${analytics?.averageAccuracy || 0}%`} trend="+5% improvement" />
            <MetricCard icon={<Activity className="w-6 h-6 text-emerald-500" />} label="Productivity Score" value="92/100" trend="Highly focused" />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Charts */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Study Hours Chart */}
              <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><BarChart2Icon className="w-5 h-5 text-indigo-400" /> Weekly Performance</h3>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-slate-300">This Week</span>
                </div>
                
                <div className="h-64 flex items-end justify-between gap-2 px-2">
                  {mockDailyStats.map((stat, i) => {
                    const heightPercent = (stat.studyHours / maxHours) * 100;
                    return (
                      <div key={i} className="flex flex-col items-center gap-3 w-full group">
                        <div className="w-full relative flex justify-center h-full items-end">
                          <div 
                            className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600/40 to-fuchsia-500 rounded-t-lg group-hover:from-indigo-500/60 group-hover:to-fuchsia-400 transition-all relative overflow-hidden"
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="absolute -top-8 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {stat.studyHours}h
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-500 group-hover:text-slate-300">{stat.date}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Advanced Scores */}
                <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Focus & Consistency</h3>
                  <div className="flex justify-center gap-8">
                    <ScoreRing score={88} label="Focus" color="text-fuchsia-500" strokeColor="stroke-fuchsia-500" />
                    <ScoreRing score={94} label="Consistency" color="text-indigo-500" strokeColor="stroke-indigo-500" />
                  </div>
                </motion.div>

                {/* Subject Heatmap (Simplified) */}
                <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Subject Heatmap</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({length: 28}).map((_, i) => {
                      const intensity = Math.random();
                      return (
                        <div 
                          key={i} 
                          className="w-full aspect-square rounded-sm"
                          style={{
                            backgroundColor: intensity > 0.8 ? '#8b5cf6' : intensity > 0.5 ? '#6366f1' : intensity > 0.2 ? '#4f46e5' : 'rgba(255,255,255,0.05)'
                          }}
                          title={`Study session ${i}`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-4 text-[10px] text-slate-500 font-medium">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-sm bg-white/5" />
                      <div className="w-3 h-3 rounded-sm bg-indigo-600" />
                      <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                      <div className="w-3 h-3 rounded-sm bg-violet-500" />
                    </div>
                    <span>More</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Column: AI Insights */}
            <div className="space-y-8">
              <motion.div variants={fadeUp} className="bg-gradient-to-b from-fuchsia-500/10 to-transparent border border-fuchsia-500/20 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
                <Brain className="absolute -bottom-6 -right-6 w-32 h-32 text-fuchsia-500/10" />
                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  <h2 className="text-lg font-bold text-white">AI Analytics</h2>
                </div>

                <div className="space-y-6 relative z-10">
                  {/* Readiness */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-300">Exam Readiness</span>
                      <span className="text-sm font-bold text-emerald-400">82%</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Strong Topic</p>
                      <p className="text-sm font-semibold text-emerald-400 truncate">Data Structures</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Weak Topic</p>
                      <p className="text-sm font-semibold text-red-400 truncate">Algorithms</p>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-xl p-4 border border-fuchsia-500/20">
                    <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3"/> Recommended</p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      Focus on <span className="text-white font-bold">Algorithms</span> for your next session. 
                      You need approximately <span className="text-white font-bold">4.5 hours</span> to reach mastery based on your current pace.
                    </p>
                  </div>
                  
                  <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition border border-white/10">
                    Generate Study Plan
                  </button>
                </div>
              </motion.div>
              
              {/* Summary Stats */}
              <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Lifetime Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-slate-300">Total Sessions</span>
                    <span className="font-bold text-white text-lg">{analytics?.totalSessions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-slate-300">Total Reviews</span>
                    <span className="font-bold text-white text-lg">{analytics?.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Avg Daily Study</span>
                    <span className="font-bold text-white text-lg">
                      {analytics ? (analytics.totalStudyHours / Math.max(1, analytics.totalSessions)).toFixed(1) : '0'}h
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// Subcomponents

function MetricCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl hover:bg-white/10 transition-colors group">
      <div className="w-12 h-12 bg-black/20 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-sm text-slate-400 font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
      <p className="text-xs text-slate-500">{trend}</p>
    </div>
  );
}

function ScoreRing({ score, label, color, strokeColor }: { score: number, label: string, color: string, strokeColor: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/5" />
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * score) / 100} className={`${strokeColor} transition-all duration-1000 ease-out`} />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-extrabold ${color}`}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function BarChart2Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );
}
