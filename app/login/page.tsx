'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, BookOpen, Target, Brain, TrendingUp, Sparkles, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#0B0F19] text-slate-200 overflow-hidden relative selection:bg-indigo-500/30 font-sans">
      
      {/* LEFT PANEL - BRANDING & FEATURES (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-white/5 bg-black/20 z-10">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob [animation-delay:2s]" />
          <div className="absolute -bottom-32 left-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob [animation-delay:4s]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <div className="w-full h-full bg-[#131825] rounded-[11px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Sleek.ai</span>
          </Link>

          <motion.div initial="hidden" animate="show" variants={stagger} className="mt-24 max-w-lg">
            <motion.h1 variants={fadeUp} className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Continue Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Smarter.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-400 leading-relaxed mb-12">
              Transform your syllabi into personalized, AI-driven study plans. Master your courses faster with smart progress tracking and interactive revision.
            </motion.p>

            <div className="space-y-4">
              {[
                { icon: Brain, title: 'AI-Powered Study Plans', desc: 'Auto-generated timelines based on your syllabus.' },
                { icon: TrendingUp, title: 'Smart Progress Tracking', desc: 'Visualize your mastery and stay on target.' },
                { icon: Target, title: 'Personalized Roadmaps', desc: 'Focus exactly where you need to improve.' }
              ].map((feature, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Trust Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10 mt-12 pt-12 border-t border-white/10">
          <div className="flex items-center gap-8 text-sm">
            <div>
              <p className="text-2xl font-bold text-white mb-1">10k+</p>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-xs">Students Supported</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white mb-1">50k+</p>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-xs">Study Sessions</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL - AUTH FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20">
        
        {/* Mobile background blobs */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -right-20 w-[300px] h-[300px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[80px] animate-blob" />
          <div className="absolute bottom-1/4 -left-20 w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[80px] animate-blob [animation-delay:2s]" />
        </div>

        <Link href="/" className="absolute top-8 left-8 lg:hidden flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-30">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
          
          <div className="text-center mb-10">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-bold text-white tracking-tight">Sleek.ai</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
            <p className="text-slate-400">Log in to your premium study dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                    <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#131825] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#131825] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 group-hover:border-indigo-500 transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <Link href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="relative py-3.5 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Log in to Dashboard</span>
                )}
              </div>
            </button>
          </form>

          <p className="text-center text-slate-400 mt-8 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-white hover:text-indigo-400 transition-colors">
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
