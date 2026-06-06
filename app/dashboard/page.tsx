'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { courseAPI, authAPI } from '@/lib/api';
import {
  BookOpen, Upload, BarChart3, MessageSquare, Plus, Trash2, X, Flame, Zap, Target, Clock, Trophy, Brain,
  CheckCircle2, Circle, TrendingUp, Star, Play,
  ChevronRight, Sparkles, Timer, Calendar as CalendarIcon, Flag, RefreshCcw
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

interface Course {
  _id: string; name: string; subject: string;
  progress: number; status: string; totalEstimatedHours: number;
}

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
];

const WEEKLY_DATA = [
  { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 }, { day: 'Thu', hours: 4.1 },
  { day: 'Fri', hours: 3.5 }, { day: 'Sat', hours: 5.0 },
  { day: 'Sun', hours: 2.0 },
];

const TASKS = [
  { id: 1, text: 'Review Chapter 4 – Data Structures', priority: 'high', done: false },
  { id: 2, text: 'Complete 10 practice problems', priority: 'med', done: true },
  { id: 3, text: 'Watch AI lecture series', priority: 'low', done: false },
  { id: 4, text: 'Revise flashcards', priority: 'med', done: false },
];

const AI_TIPS = [
  { icon: '🧠', title: 'Weak Area Detected', desc: 'You spend less time on Algorithms. Consider 30 min daily.' },
  { icon: '⚡', title: 'Smart Suggestion', desc: 'Your best study window is 9–11 AM based on your history.' },
  { icon: '🎯', title: 'Goal Insight', desc: 'You are 2 study sessions away from your weekly goal!' },
];

const ACTIVITY = [
  { icon: '✅', text: 'Completed: Introduction to React', time: '2h ago' },
  { icon: '📝', text: 'Notes generated for Chapter 3', time: '5h ago' },
  { icon: '🤖', text: 'AI Tutor session – 20 minutes', time: '1d ago' },
  { icon: '🏆', text: 'Quiz Score: 92% – Algorithms', time: '2d ago' },
];

const fadeUp: any = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger: any = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${className}`}>{children}</div>
);

const StatCard = ({ icon, label, value, color }: any) => (
  <motion.div variants={fadeUp}>
    <GlassCard className="p-5 flex items-center gap-4 hover:border-white/20 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </GlassCard>
  </motion.div>
);

function PomodoroWidget({ user }: { user: any }) {
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);

  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from user preferences
  useEffect(() => {
    if (user?.preferences?.pomodoro) {
      const fTime = user.preferences.pomodoro.focusTime || 25;
      const bTime = user.preferences.pomodoro.breakTime || 5;
      setFocusTime(fTime);
      setBreakTime(bTime);
      if (!running && mode === 'focus') setSecs(fTime * 60);
    }
  }, [user]);

  // Timer logic
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) {
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (ref.current) {
      clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, mode, focusTime, breakTime]);

  const handleComplete = () => {
    setRunning(false);
    if (mode === 'focus') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Session Complete!', { body: 'Time for a break.' });
      }
      setSessionsCompleted(prev => prev + 1);
      setTodayFocusMinutes(prev => prev + focusTime);
      setMode('break');
      setSecs(breakTime * 60);
    } else {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Break Complete!', { body: 'Time to focus.' });
      }
      setMode('focus');
      setSecs(focusTime * 60);
    }
  };

  const applyPreset = (f: number, b: number) => {
    setFocusTime(f);
    setBreakTime(b);
    setMode('focus');
    setSecs(f * 60);
    setRunning(false);
    if (user) {
      authAPI.updatePreferences({ preferences: { pomodoro: { focusTime: f, breakTime: b } } }).catch(console.error);
    }
  };

  const skipBreak = () => {
    setMode('focus');
    setSecs(focusTime * 60);
    setRunning(false);
  };

  const requestNotif = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">Pomodoro Timer</span>
        </div>
        <button onClick={requestNotif} className="text-[10px] text-slate-400 hover:text-white transition">Enable Alerts</button>
      </div>

      <div className="flex justify-center gap-4 mb-4">
        <div className="text-center">
          <input
            type="number"
            value={focusTime}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 25;
              setFocusTime(val);
              if (mode === 'focus' && !running) setSecs(val * 60);
            }}
            className="w-16 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-bold py-1 mb-1 focus:outline-none focus:border-violet-500 text-white"
          />
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Focus</p>
        </div>
        <div className="text-center">
          <input
            type="number"
            value={breakTime}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 5;
              setBreakTime(val);
              if (mode === 'break' && !running) setSecs(val * 60);
            }}
            className="w-16 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-bold py-1 mb-1 focus:outline-none focus:border-emerald-500 text-white"
          />
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Break</p>
        </div>
      </div>

      <div className={`text-center mb-5 rounded-2xl py-6 ${mode === 'focus' ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mode === 'focus' ? 'text-violet-400' : 'text-emerald-400'}`}>{mode === 'focus' ? 'Focus Mode' : 'Break Time'}</p>
        <p className="text-5xl font-mono font-bold text-white tracking-tight">{m}:{s}</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setRunning(r => !r)} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition ${mode === 'focus' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{running ? 'Pause' : 'Start'}</button>
        <button onClick={() => { setRunning(false); setSecs(mode === 'focus' ? focusTime * 60 : breakTime * 60); }} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-sm transition">Reset</button>
        {mode === 'break' && (
          <button onClick={skipBreak} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-sm transition" title="Skip Break"><ChevronRight className="w-4 h-4" /></button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {[{ f: 25, b: 5 }, { f: 45, b: 10 }, { f: 60, b: 15 }, { f: 90, b: 20 }].map(p => (
          <button key={`${p.f}-${p.b}`} onClick={() => applyPreset(p.f, p.b)} className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-400 transition">{p.f}/{p.b}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 mb-1">Today</p>
          <p className="text-xs font-bold text-white">{todayFocusMinutes}m</p>
        </div>
        <div className="text-center border-l border-white/5">
          <p className="text-[10px] text-slate-500 mb-1">Sessions</p>
          <p className="text-xs font-bold text-white">{sessionsCompleted}</p>
        </div>
        <div className="text-center border-l border-white/5">
          <p className="text-[10px] text-slate-500 mb-1">Streak</p>
          <p className="text-xs font-bold text-orange-400 flex items-center justify-center gap-1"><Flame className="w-3 h-3" /> {user?.streak || 0}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function CalendarWidget() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDate();
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-emerald-400" /><span className="text-sm font-semibold text-slate-200">june</span></div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-500">
        {days.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {Array.from({ length: 31 }).map((_, i) => {
          const date = i + 1;
          const isToday = date === today;
          return (
            <div key={i} className={`py-1.5 rounded-lg ${isToday ? 'bg-emerald-500 text-white font-bold' : 'text-slate-300 hover:bg-white/5 cursor-pointer transition'}`}>
              {date}
            </div>
          )
        })}
      </div>
    </GlassCard>
  );
}

function ExamCountdownWidget() {
  return (
    <GlassCard className="p-5 bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20">
      <div className="flex items-center gap-2 mb-3"><Flag className="w-4 h-4 text-red-400" /><span className="text-sm font-semibold text-slate-200">Exam Countdown</span></div>
      <h3 className="font-bold text-white mb-1">Finals: Data Structures</h3>
      <div className="flex items-end gap-2 mb-3 text-red-400">
        <span className="text-4xl font-black">12</span><span className="text-sm font-semibold mb-1">Days</span>
      </div>
      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 rounded-full" style={{ width: '65%' }} />
      </div>
    </GlassCard>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 32; const circ = 2 * Math.PI * r;
  return (
    <svg width="80" height="80" className="rotate-[-90deg]">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#ffffff10" strokeWidth="6" />
      <circle cx="40" cy="40" r={r} fill="none" stroke="url(#grad)" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" />
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient></defs>
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState(TASKS);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [userData, coursesData, recData] = await Promise.all([
          authAPI.getMe(),
          courseAPI.getAll(),
          courseAPI.getRecommendations().catch(() => [])
        ]);
        setUser(userData);
        setCourses(coursesData);
        setRecommendations(recData);
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    })();
  }, [router]);


  const handleDelete = async (id: string) => {
    setDeleting(true);
    try { await courseAPI.delete(id); setCourses(p => p.filter(c => c._id !== id)); setDeleteConfirm(null); }
    catch (e) { console.error(e); } finally { setDeleting(false); }
  };

  const totalHours = courses.reduce((a, c) => a + (c.totalEstimatedHours || 0), 0);
  const avgProgress = courses.length ? Math.round(courses.reduce((a, c) => a + c.progress, 0) / courses.length) : 0;
  const doneTasks = tasks.filter(t => t.done).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f0f1a 60%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading your workspace…</p>
      </div>
    </div>
  );

  const courseToDelete = courses.find(c => c._id === deleteConfirm);

  return (
    <div className="min-h-screen text-white" style={{ background: 'radial-gradient(ellipse at 20% 0%, #1e1040 0%, #0a0a14 50%, #0f0f1a 100%)' }}>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* HERO */}
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-10"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 50%, rgba(6,182,212,0.05) 100%)' }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #6366f140 0%, transparent 50%)' }} />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Welcome back 👋</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{user?.name || 'Student'}</h1>
                <p className="text-slate-400 italic text-sm max-w-md">"{quote}"</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-400" /><span className="text-orange-300 font-semibold text-sm">7 Day Streak</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <Zap className="w-4 h-4 text-yellow-400" /><span className="text-yellow-300 font-semibold text-sm">Level 12 · 2450 XP</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Target className="w-4 h-4 text-emerald-400" /><span className="text-emerald-300 font-semibold text-sm">Daily Goal: {doneTasks}/{tasks.length}</span>
                </div>
              </div>
            </div>
            {/* Goal Progress Bar */}
            <div className="relative mt-6">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Daily Goal Progress</span><span>{Math.round((doneTasks / tasks.length) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                  initial={{ width: 0 }} animate={{ width: `${(doneTasks / tasks.length) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Upload Syllabus', icon: <Upload className="w-5 h-5" />, href: '/upload', color: 'from-indigo-600 to-indigo-700' },
            { label: 'AI Tutor', icon: <MessageSquare className="w-5 h-5" />, href: '/chat', color: 'from-violet-600 to-violet-700' },
            { label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '/analytics', color: 'from-cyan-600 to-cyan-700' },
            { label: 'Study Plan', icon: <Brain className="w-5 h-5" />, href: '/planner', color: 'from-emerald-600 to-emerald-700' },
          ].map(a => (
            <motion.div key={a.href} variants={fadeUp}>
              <Link href={a.href}>
                <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${a.color} hover:opacity-90 hover:scale-[1.02] transition-all duration-200 cursor-pointer shadow-lg`}>
                  {a.icon}<span className="font-semibold text-sm">{a.label}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* STATS */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<BookOpen className="w-5 h-5 text-indigo-400" />} label="Total Courses" value={courses.length} color="bg-indigo-500/15" />
          <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} label="Avg. Progress" value={`${avgProgress}%`} color="bg-emerald-500/15" />
          <StatCard icon={<Clock className="w-5 h-5 text-cyan-400" />} label="Estimated Hours" value={totalHours} color="bg-cyan-500/15" />
          <StatCard icon={<Trophy className="w-5 h-5 text-yellow-400" />} label="Achievements" value="8" color="bg-yellow-500/15" />
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Charts + Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Chart */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-400" />Weekly Study Hours</h2>
                  <span className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full">This Week · 22.1h</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={WEEKLY_DATA} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid #ffffff15', borderRadius: 12, color: '#fff' }} cursor={{ fill: '#ffffff05' }} />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </motion.div>

            {/* Courses */}
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" />Your Courses</h2>
                <Link href="/upload"><button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"><Plus className="w-3.5 h-3.5" />Add Course</button></Link>
              </div>
              {courses.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No courses yet. Upload a syllabus to begin.</p>
                  <Link href="/upload"><button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold transition">Upload Syllabus</button></Link>
                </GlassCard>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <motion.div key={course._id} variants={fadeUp} className="relative group">
                      <Link href={`/course/${course._id}`}>
                        <GlassCard className="p-5 hover:border-indigo-500/40 hover:bg-white/8 transition-all duration-300 cursor-pointer">
                          <div className="flex items-start gap-4">
                            <div className="relative flex-shrink-0">
                              <ProgressRing pct={course.progress} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{course.progress}%</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white truncate mb-1">{course.name}</h3>
                              <p className="text-xs text-slate-400 mb-3">{course.subject}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.totalEstimatedHours}h</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-indigo-500/15 text-indigo-400'}`}>{course.status || 'Active'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400 font-medium">
                            <Play className="w-3 h-3" />Continue Learning<ChevronRight className="w-3 h-3 ml-auto" />
                          </div>
                        </GlassCard>
                      </Link>
                      <button onClick={e => { e.preventDefault(); e.stopPropagation(); setDeleteConfirm(course._id); }}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all duration-200">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* AI Recommended Courses */}
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <div className="flex items-center justify-between mb-4 mt-8">
                <h2 className="font-bold text-white flex items-center gap-2"><Brain className="w-5 h-5 text-indigo-400" />🤖 Recommended For You</h2>
              </div>
              {recommendations.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {recommendations.map((rec: any) => (
                    <motion.div key={rec.id} variants={fadeUp} className="relative group">
                      <GlassCard className="p-5 hover:border-indigo-500/40 hover:bg-white/8 transition-all duration-300 flex flex-col h-full">
                        <h3 className="font-bold text-white text-lg truncate mb-3">{rec.name}</h3>

                        <div className="text-xs text-indigo-300 bg-indigo-500/10 p-2.5 rounded-xl mb-3 border border-indigo-500/20">
                          <span className="font-bold text-indigo-400 block mb-1">Why this recommendation?</span>
                          {rec.reason}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-slate-300">
                          <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5"><Star className="w-3.5 h-3.5 text-yellow-400" /> {rec.difficulty}</span>
                          <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {rec.duration}</span>
                        </div>

                        <div className="text-xs text-slate-300 mb-6 flex-1">
                          <span className="font-semibold text-emerald-400 mr-1 flex items-center gap-1.5 mb-1"><TrendingUp className="w-3.5 h-3.5" /> Career Benefits:</span>
                          <span className="opacity-90">{rec.careerBenefits}</span>
                        </div>

                        <button className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-indigo-600 text-white text-sm font-bold transition-all group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                          Start Learning <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-6 text-center text-slate-400">
                  <Brain className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  Gathering AI insights... Keep studying to unlock personalized recommendations!
                </GlassCard>
              )}
            </motion.div>
          </div>

          {/* RIGHT: Widgets */}
          <div className="space-y-5">
            {/* Pomodoro */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}><PomodoroWidget user={user} /></motion.div>

            {/* Exam Countdown */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}><ExamCountdownWidget /></motion.div>

            {/* Calendar */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}><CalendarWidget /></motion.div>

            {/* Today's Tasks */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-cyan-400" /><span className="font-semibold text-sm">Today's Plan</span></div>
                <div className="space-y-2.5">
                  {tasks.map(task => (
                    <button key={task.id} onClick={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                      className="w-full flex items-center gap-3 text-left group">
                      {task.done ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition" />}
                      <span className={`text-xs flex-1 ${task.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{task.text}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500/15 text-red-400' : task.priority === 'med' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>{task.priority}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* AI Hub */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><Brain className="w-4 h-4 text-violet-400" /><span className="font-semibold text-sm">AI Hub</span></div>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">Smart Tools</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 border-b border-white/5 pb-4">
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Avg Score</p>
                    <p className="text-lg font-bold text-white flex items-center gap-1">85%</p>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-lg font-bold text-white">12</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href="/quiz" className="block w-full">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Target className="w-4 h-4" /></div>
                        <div><p className="text-xs font-semibold text-white">Quiz Generator</p><p className="text-[10px] text-slate-400">Test your knowledge</p></div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </Link>

                  <Link href="/notes" className="block w-full">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><BookOpen className="w-4 h-4" /></div>
                        <div><p className="text-xs font-semibold text-white">Notes Generator</p><p className="text-[10px] text-slate-400">AI study materials</p></div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </Link>

                  <Link href="/revision" className="block w-full">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400"><RefreshCcw className="w-4 h-4" /></div>
                        <div><p className="text-xs font-semibold text-white">Smart Revision</p><p className="text-[10px] text-slate-400">Spaced repetition</p></div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>

            {/* Activity Feed */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-yellow-400" /><span className="font-semibold text-sm">Recent Activity</span></div>
                <div className="space-y-3">
                  {ACTIVITY.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-base">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate">{a.text}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13111f] border border-white/10 rounded-2xl p-7 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-400" /></div>
                <h2 className="font-bold text-white">Delete Course</h2>
              </div>
              <button onClick={() => setDeleteConfirm(null)} className="text-slate-500 hover:text-white transition"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-slate-400 text-sm mb-1">Delete <span className="font-semibold text-white">"{courseToDelete.name}"</span>?</p>
            <p className="text-xs text-slate-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition">{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
