'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, LogOut, User, Bell, Palette, Shield, Clock, Timer, CheckCircle2, AlertTriangle } from 'lucide-react';
import { authAPI, clearAuthToken } from '@/lib/api';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const stagger: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function SettingsPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notifications: true,
    dailyReminder: true,
    pomodoroFocusTime: 25,
    pomodoroBreakTime: 5,
    reminderDailyTime: '09:00',
    reminderRevisionTime: '18:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          notifications: userData.preferences?.notifications ?? true,
          dailyReminder: userData.preferences?.dailyReminder ?? true,
          pomodoroFocusTime: userData.preferences?.pomodoro?.focusTime ?? 25,
          pomodoroBreakTime: userData.preferences?.pomodoro?.breakTime ?? 5,
          reminderDailyTime: userData.preferences?.reminders?.dailyTime ?? '09:00',
          reminderRevisionTime: userData.preferences?.reminders?.revisionTime ?? '18:00',
        }));
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await authAPI.updatePreferences({
        name: formData.name,
        preferences: {
          theme: resolvedTheme || 'dark',
          notifications: formData.notifications,
          dailyReminder: formData.dailyReminder,
          pomodoro: {
            focusTime: formData.pomodoroFocusTime,
            breakTime: formData.pomodoroBreakTime,
          },
          reminders: {
            dailyTime: formData.reminderDailyTime,
            revisionTime: formData.reminderRevisionTime,
          }
        },
      });
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-full bg-[#0B0F19] text-slate-200 relative overflow-hidden selection:bg-indigo-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob pointer-events-none" />
      
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 relative z-10">
        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
          
          <div className="flex flex-col gap-2 mb-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Settings</h1>
            <p className="text-slate-400 text-lg">Manage your account, preferences, and learning workspace.</p>
          </div>

          {message.text && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`px-6 py-4 rounded-xl flex items-center gap-3 font-medium shadow-lg backdrop-blur-md border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Profile Information */}
            <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:bg-white/10 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-400" /> Profile Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3.5 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider font-bold">Contact support to change email</p>
                </div>
              </div>
            </motion.div>

            {/* Appearance & Notifications */}
            <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:bg-white/10 transition-colors duration-300">
                <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                  <Palette className="w-5 h-5 text-fuchsia-400" /> Appearance
                </h2>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Theme Preference</label>
                  <select
                    value={resolvedTheme || 'dark'}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3.5 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="dark" className="bg-[#131825]">Dark Theme (Sleek)</option>
                    <option value="light" className="bg-[#131825]">Light Theme</option>
                  </select>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:bg-white/10 transition-colors duration-300">
                <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                  <Bell className="w-5 h-5 text-emerald-400" /> Notifications
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all">
                    <div>
                      <span className="block text-sm font-bold text-white">Email Updates</span>
                      <span className="block text-xs text-slate-400">Receive progress reports</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                      className="w-5 h-5 rounded bg-black/40 border-white/20 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all">
                    <div>
                      <span className="block text-sm font-bold text-white">Daily Reminders</span>
                      <span className="block text-xs text-slate-400">Study streak alerts</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.dailyReminder}
                      onChange={(e) => setFormData({ ...formData, dailyReminder: e.target.checked })}
                      className="w-5 h-5 rounded bg-black/40 border-white/20 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                    />
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Productivity Systems */}
            <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:bg-white/10 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                <Timer className="w-5 h-5 text-amber-400" /> Productivity Tools
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Pomodoro */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Pomodoro Config</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Focus Session</label>
                    <select
                      value={formData.pomodoroFocusTime}
                      onChange={(e) => setFormData({ ...formData, pomodoroFocusTime: parseInt(e.target.value, 10) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 transition-all"
                    >
                      <option value="25">25 minutes (Standard)</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes (Deep Work)</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Break Duration</label>
                    <select
                      value={formData.pomodoroBreakTime}
                      onChange={(e) => setFormData({ ...formData, pomodoroBreakTime: parseInt(e.target.value, 10) })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 transition-all"
                    >
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes (Long Break)</option>
                    </select>
                  </div>
                </div>

                {/* Reminders */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Schedule</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Study Time</label>
                    <input
                      type="time"
                      value={formData.reminderDailyTime}
                      onChange={(e) => setFormData({ ...formData, reminderDailyTime: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Revision Time</label>
                    <input
                      type="time"
                      value={formData.reminderRevisionTime}
                      onChange={(e) => setFormData({ ...formData, reminderRevisionTime: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Save Action */}
            <motion.div variants={fadeUp} className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50"
              >
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving Changes...</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Preferences</>
                )}
              </button>
            </motion.div>
          </form>

          {/* Danger Zone */}
          <motion.div variants={fadeUp} className="mt-12 bg-red-500/5 border border-red-500/20 rounded-3xl p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-3">
              <Shield className="w-5 h-5" /> Security & Session
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-slate-300 font-medium mb-1">Terminate active session</p>
                <p className="text-xs text-slate-500">Logging out will clear your local session securely. You will need your credentials to access your workspace again.</p>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Secure Logout
              </button>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </main>
  );
}
