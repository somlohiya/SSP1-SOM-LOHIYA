'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Share2, Edit3, MapPin, Calendar, GraduationCap, Trophy, 
  Flame, Zap, BookOpen, Target, Clock, Shield, Star, CheckCircle, 
  Code, Briefcase, Github, Linkedin, Globe, Mail, Download, 
  Brain, TrendingUp, BarChart3, Medal, Activity, Sparkles, X, Save
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { authAPI } from '@/lib/api';

const BADGES = [
  { title: 'Beginner Learner', icon: '🌱', unlocked: true },
  { title: 'Consistency Champion', icon: '🔥', unlocked: true },
  { title: 'Quiz Master', icon: '👑', unlocked: true },
  { title: 'Course Finisher', icon: '🎓', unlocked: true },
  { title: 'AI Explorer', icon: '🤖', unlocked: true },
  { title: 'Productivity Hero', icon: '⚡', unlocked: true },
  { title: '7 Day Streak', icon: '📅', unlocked: true },
  { title: '30 Day Streak', icon: '🚀', unlocked: true },
];

const PROGRAMMING_LANGUAGES = [
  { name: 'JavaScript', level: 95, color: 'bg-yellow-400' },
  { name: 'TypeScript', level: 90, color: 'bg-blue-500' },
  { name: 'Python', level: 85, color: 'bg-green-500' },
  { name: 'Java', level: 75, color: 'bg-orange-500' },
  { name: 'C++', level: 65, color: 'bg-indigo-500' },
];

const TECHNOLOGIES = [
  { name: 'React', level: 95, color: 'bg-cyan-400' },
  { name: 'Next.js', level: 90, color: 'bg-slate-200' },
  { name: 'Node.js', level: 85, color: 'bg-emerald-500' },
  { name: 'MongoDB', level: 80, color: 'bg-green-600' },
  { name: 'Tailwind CSS', level: 95, color: 'bg-teal-400' },
];

const CERTIFICATIONS = [
  { name: 'AWS Cloud Practitioner', date: 'Oct 2025', provider: 'Amazon Web Services', id: 'AWS-123456' },
  { name: 'React Native Developer', date: 'Aug 2025', provider: 'Meta', id: 'META-789012' },
  { name: 'Machine Learning Basics', date: 'May 2025', provider: 'Stanford Online', id: 'STAN-345678' },
];

const ACTIVITY_FEED = [
  { type: 'course', title: 'Finished Course', desc: 'Advanced Database Systems', time: '2 hours ago', icon: <CheckCircle className="text-emerald-400" /> },
  { type: 'note', title: 'Generated Notes', desc: 'React Hooks Deep Dive', time: 'Yesterday', icon: <BookOpen className="text-cyan-400" /> },
  { type: 'ai', title: 'AI Tutor Session', desc: 'Discussed B-Trees', time: 'Yesterday', icon: <Brain className="text-violet-400" /> },
  { type: 'quiz', title: 'Quiz Attempt', desc: 'Scored 98% in Algorithms', time: '3 days ago', icon: <Target className="text-yellow-400" /> },
  { type: 'upload', title: 'Uploaded Syllabus', desc: 'Machine Learning 101', time: '1 week ago', icon: <CheckCircle className="text-emerald-400" /> },
];

const AI_INSIGHTS = {
  strong: ['Algorithms', 'Frontend Web Dev', 'Database Design'],
  weak: ['Physics', 'Advanced Calculus'],
  suggestions: [
    'Schedule 30 mins of Physics review daily.',
    'Take a mock exam for Advanced Calculus this weekend.'
  ],
  nextCourse: 'Machine Learning Fundamentals',
  examReadiness: 88,
  productivityScore: 92,
};

const GOALS = [
  { title: 'Daily Goal', current: 2, target: 3, label: 'Study Sessions' },
  { title: 'Weekly Goal', current: 18, target: 20, label: 'Study Hours' },
  { title: 'Monthly Goal', current: 85, target: 100, label: 'Topics Completed' },
];

const AI_SCORES = [
  { label: 'Learning', value: 94, color: 'stroke-emerald-400' },
  { label: 'Productivity', value: 92, color: 'stroke-indigo-400' },
  { label: 'Consistency', value: 88, color: 'stroke-orange-400' },
  { label: 'Exam Ready', value: 85, color: 'stroke-cyan-400' },
];

// Reusable Components
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-[#0f111a]/80 backdrop-blur-2xl shadow-xl ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ title, icon }: { title: string, icon?: React.ReactNode }) => (
  <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
    {icon} {title}
  </h2>
);

const fadeUp: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const stagger: any = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

function AnimatedCounter({ value, suffix = '' }: { value: string | number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const numValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) : value;
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = numValue / (duration / 16);
    if (numValue === 0) return setCount(0);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numValue) {
        setCount(numValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numValue]);

  return <span>{count}{suffix}</span>;
}

export default function PremiumProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    avatar: '',
    college: '',
    branch: '',
    gradYear: '',
    bio: '',
    github: '',
    linkedin: '',
    portfolio: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [userData, statsData] = await Promise.all([
        authAPI.getMe(),
        authAPI.getProfileStats()
      ]);
      
      setUser(userData);
      setStats(statsData.stats);
      setHeatmapData(statsData.heatmap || Array.from({ length: 119 }).map((_, i) => ({
        date: new Date(Date.now() - (118 - i) * 24 * 60 * 60 * 1000),
        intensity: 0
      })));
      setPerformanceData(statsData.performanceData || []);
      
      setEditForm({
        name: userData.name || '',
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
        college: userData.college || '',
        branch: userData.branch || '',
        gradYear: userData.gradYear || '',
        bio: userData.bio || '',
        github: userData.github || '',
        linkedin: userData.linkedin || '',
        portfolio: userData.portfolio || '',
      });
    } catch (error) {
      console.error('Failed to load profile data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await authAPI.updatePreferences(editForm);
      await fetchProfileData();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05050a] text-white">
        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
        <Link href="/dashboard" className="px-6 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const STATS = [
    { label: 'Total Courses', value: stats.totalCourses || 0, icon: <BookOpen className="text-indigo-400" /> },
    { label: 'Topics Completed', value: stats.completedTopics || 0, icon: <CheckCircle className="text-emerald-400" /> },
    { label: 'Total Topics', value: stats.totalTopics || 0, icon: <Target className="text-blue-400" /> },
    { label: 'Study Hours', value: stats.totalStudyHours || 0, icon: <Clock className="text-cyan-400" /> },
    { label: 'Quiz Attempts', value: stats.quizAttempts || 0, icon: <Shield className="text-violet-400" /> },
    { label: 'Notes Generated', value: stats.notesGenerated || 0, icon: <Briefcase className="text-pink-400" /> },
    { label: 'AI Sessions', value: stats.aiSessions || 0, icon: <Brain className="text-yellow-400" /> },
    { label: 'Overall Progress', value: `${stats.overallProgress || 0}%`, icon: <TrendingUp className="text-emerald-400" /> },
  ];

  const currentLevel = user.level || Math.floor((user.xp || 0) / 1000) + 1;
  const currentXP = user.xp || 0;
  const rank = currentLevel >= 50 ? 'Diamond' : currentLevel >= 30 ? 'Platinum' : currentLevel >= 15 ? 'Gold' : currentLevel >= 5 ? 'Silver' : 'Bronze';

  return (
    <div className="min-h-screen text-slate-200 bg-[#05050a] selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* GLOBAL BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        
        {/* TOP NAVIGATION */}
        <nav className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium text-sm">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition font-medium text-sm shadow-lg shadow-indigo-500/20"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </nav>

        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
          
          {/* ==========================================
              PROFILE HERO SECTION
          ========================================== */}
          <motion.div variants={fadeUp}>
            <GlassCard className="overflow-hidden relative group">
              {/* Cover Banner */}
              <div className="h-64 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f111a] to-transparent" />
              </div>
              
              {/* Profile Details */}
              <div className="px-6 md:px-10 pb-10 relative">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-end -mt-24 mb-6">
                  {/* Avatar */}
                  <div className="relative group/avatar">
                    <div className="w-40 h-40 rounded-3xl bg-[#0f111a] border-[6px] border-[#0f111a] overflow-hidden shadow-2xl relative z-10">
                      <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full object-cover bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                    </div>
                    {/* Floating Rank Badge */}
                    <div className="absolute -bottom-3 -right-3 z-20 bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl border-4 border-[#0f111a] shadow-xl flex items-center gap-1.5">
                      <Medal className="w-3.5 h-3.5" /> {rank}
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 pb-2">
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{user.name}</h1>
                    <p className="text-indigo-400 font-semibold text-lg mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5" /> {user.branch || 'Add Branch'}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400 font-medium">
                      <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-slate-500" /> {user.college || 'Add College'}</span>
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /> {user.email}</span>
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500" /> Class of {user.gradYear || 'N/A'}</span>
                    </div>
                    {user.bio && <p className="text-slate-300 mt-4 max-w-2xl">{user.bio}</p>}
                  </div>
                  
                  {/* Hero Stats */}
                  <div className="flex gap-4 pb-2 w-full md:w-auto">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[120px] backdrop-blur-md">
                      <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Total XP</div>
                      <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center gap-1.5">
                        <Zap className="w-5 h-5 text-emerald-400" /> <AnimatedCounter value={currentXP} />
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[120px] backdrop-blur-md">
                      <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Day Streak</div>
                      <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center gap-1.5">
                        <Flame className="w-5 h-5 text-orange-400" /> <AnimatedCounter value={user.streak || 0} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* ==========================================
              STUDENT OVERVIEW (STATISTICS)
          ========================================== */}
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 flex flex-col justify-center relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                    {stat.icon}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black text-white mb-1">
                    <AnimatedCounter value={stat.value} suffix={String(stat.value).includes('%') ? '%' : ''} />
                  </div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* ==========================================
                LEFT COLUMN (Main Content)
            ========================================== */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* LEARNING ANALYTICS */}
              <motion.div variants={fadeUp}>
                <GlassCard className="p-8">
                  <SectionTitle title="Learning Analytics" icon={<BarChart3 className="text-indigo-400" />} />
                  <div className="h-[300px] w-full">
                    {performanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                          <Tooltip 
                            contentStyle={{ background: '#0f111a', border: '1px solid #ffffff1a', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                            itemStyle={{ color: '#fff', fontWeight: 600 }}
                          />
                          <Area type="monotone" dataKey="topics" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" name="Topics Completed" />
                          <Area type="monotone" dataKey="hours" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" name="Study Hours" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        No performance data available yet. Start studying!
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>

              {/* GITHUB STYLE HEATMAP */}
              <motion.div variants={fadeUp}>
                <GlassCard className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <SectionTitle title="Study Consistency" icon={<Activity className="text-emerald-400" />} />
                    <span className="text-sm font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-lg">Last 119 Days</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-start p-2 rounded-xl bg-black/20 border border-white/5">
                    {heatmapData.map((day, i) => (
                      <div 
                        key={i} 
                        className={`w-3.5 h-3.5 rounded-[3px] transition-colors duration-200 hover:scale-125 hover:z-10 cursor-crosshair ${
                          day.intensity === 0 ? 'bg-white/5 hover:bg-white/10' : 
                          day.intensity === 1 ? 'bg-emerald-900/60 hover:bg-emerald-800' : 
                          day.intensity === 2 ? 'bg-emerald-600/80 hover:bg-emerald-500' : 
                          day.intensity === 3 ? 'bg-emerald-400 hover:bg-emerald-300' : 
                          'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.5)]'
                        }`}
                        title={`${day.intensity} contributions on ${new Date(day.date).toDateString()}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-[3px] bg-white/5" />
                    <div className="w-3 h-3 rounded-[3px] bg-emerald-900/60" />
                    <div className="w-3 h-3 rounded-[3px] bg-emerald-600/80" />
                    <div className="w-3 h-3 rounded-[3px] bg-emerald-400" />
                    <div className="w-3 h-3 rounded-[3px] bg-emerald-300" />
                    <span>More</span>
                  </div>
                </GlassCard>
              </motion.div>

              {/* SKILLS & TECHNOLOGIES */}
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div variants={fadeUp}>
                  <GlassCard className="p-8 h-full">
                    <SectionTitle title="Languages" icon={<Code className="text-blue-400" />} />
                    <div className="space-y-6">
                      {PROGRAMMING_LANGUAGES.map((skill, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-slate-200 group-hover:text-white transition-colors">{skill.name}</span>
                            <span className="text-slate-400">{skill.level}%</span>
                          </div>
                          <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              className={`h-full ${skill.color} rounded-full relative`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ maskImage: 'linear-gradient(45deg, transparent 25%, black 25%, black 50%, transparent 50%, transparent 75%, black 75%, black 100%)', maskSize: '20px 20px' }} />
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
                
                <motion.div variants={fadeUp}>
                  <GlassCard className="p-8 h-full">
                    <SectionTitle title="Technologies" icon={<Zap className="text-yellow-400" />} />
                    <div className="space-y-6">
                      {TECHNOLOGIES.map((skill, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-slate-200 group-hover:text-white transition-colors">{skill.name}</span>
                            <span className="text-slate-400">{skill.level}%</span>
                          </div>
                          <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              className={`h-full ${skill.color} rounded-full relative`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ maskImage: 'linear-gradient(45deg, transparent 25%, black 25%, black 50%, transparent 50%, transparent 75%, black 75%, black 100%)', maskSize: '20px 20px' }} />
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

            </div>

            {/* ==========================================
                RIGHT COLUMN (Sidebar)
            ========================================== */}
            <div className="space-y-8">
              
              {/* XP & GAMIFICATION (Level Progress) */}
              <motion.div variants={fadeUp}>
                <GlassCard className="p-8 bg-gradient-to-br from-indigo-900/30 to-[#0f111a] border-indigo-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-indigo-300 uppercase tracking-wider">Level {currentLevel}</span>
                    <span className="text-xs font-bold text-slate-400">{currentXP.toLocaleString()} / {(currentLevel * 1000).toLocaleString()} XP</span>
                  </div>
                  <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden mb-6 border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentXP % 1000) / 10}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ maskImage: 'linear-gradient(45deg, transparent 25%, black 25%, black 50%, transparent 50%, transparent 75%, black 75%, black 100%)', maskSize: '10px 10px' }} />
                    </motion.div>
                  </div>
                  <SectionTitle title="Achievements" icon={<Trophy className="text-yellow-400" />} />
                  <div className="grid grid-cols-4 gap-3">
                    {BADGES.map((badge, i) => (
                      <div key={i} className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-500/30 transition-all cursor-help" title={badge.title}>
                        <span className="text-2xl mb-1 group-hover:scale-125 group-hover:-translate-y-1 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{badge.icon}</span>
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {badge.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* LEARNING GOALS */}
              <motion.div variants={fadeUp}>
                <GlassCard className="p-8">
                  <SectionTitle title="Learning Goals" icon={<Target className="text-orange-400" />} />
                  <div className="space-y-5">
                    {GOALS.map((goal, i) => {
                      const pct = Math.round((goal.current / goal.target) * 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between items-end mb-2">
                            <div>
                              <div className="text-sm font-bold text-white mb-0.5">{goal.title}</div>
                              <div className="text-xs text-slate-400">{goal.current} / {goal.target} {goal.label}</div>
                            </div>
                            <span className="text-sm font-bold text-orange-400">{pct}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </GlassCard>
              </motion.div>

              {/* SOCIAL & PORTFOLIO */}
              <motion.div variants={fadeUp}>
                <GlassCard className="p-8">
                  <SectionTitle title="Connect" icon={<Globe className="text-blue-400" />} />
                  <div className="space-y-3">
                    {user.github && (
                      <a href={user.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition group">
                        <div className="flex items-center gap-3 text-slate-300 group-hover:text-white transition"><Github className="w-5 h-5" /> GitHub Profile</div>
                        <ArrowLeft className="w-4 h-4 rotate-[135deg] opacity-0 group-hover:opacity-100 transition" />
                      </a>
                    )}
                    {user.linkedin && (
                      <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition group">
                        <div className="flex items-center gap-3 text-slate-300 group-hover:text-[#0a66c2] transition"><Linkedin className="w-5 h-5" /> LinkedIn</div>
                        <ArrowLeft className="w-4 h-4 rotate-[135deg] opacity-0 group-hover:opacity-100 transition" />
                      </a>
                    )}
                    {user.portfolio && (
                      <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition group">
                        <div className="flex items-center gap-3 text-slate-300 group-hover:text-emerald-400 transition"><Globe className="w-5 h-5" /> Portfolio Website</div>
                        <ArrowLeft className="w-4 h-4 rotate-[135deg] opacity-0 group-hover:opacity-100 transition" />
                      </a>
                    )}
                    <a href={`mailto:${user.email}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition group">
                      <div className="flex items-center gap-3 text-slate-300 group-hover:text-white transition"><Mail className="w-5 h-5" /> Contact Email</div>
                    </a>
                  </div>
                </GlassCard>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-400" /> Edit Profile
                </h2>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Avatar URL</label>
                    <input 
                      type="text" 
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">College / University</label>
                    <input 
                      type="text" 
                      value={editForm.college}
                      onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Branch / Major</label>
                    <input 
                      type="text" 
                      value={editForm.branch}
                      onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Graduation Year</label>
                    <input 
                      type="text" 
                      value={editForm.gradYear}
                      onChange={(e) => setEditForm({ ...editForm, gradYear: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">GitHub URL</label>
                    <input 
                      type="url" 
                      value={editForm.github}
                      onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">LinkedIn URL</label>
                    <input 
                      type="url" 
                      value={editForm.linkedin}
                      onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Portfolio URL</label>
                    <input 
                      type="url" 
                      value={editForm.portfolio}
                      onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Bio</label>
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition font-medium text-sm"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition font-medium text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
