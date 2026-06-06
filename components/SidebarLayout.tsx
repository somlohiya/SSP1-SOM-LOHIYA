'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, BarChart3, MessageSquare, Settings, User, LogOut, GraduationCap } from 'lucide-react';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const publicRoutes = ['/', '/login', '/signup'];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    const { clearAuthToken } = require('@/lib/api');
    clearAuthToken();
    window.location.href = '/login';
  };

  const menu = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard' },
    { name: 'Courses', icon: <BookOpen className="w-5 h-5" />, href: '/upload' },
    { name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '/analytics' },
    { name: 'AI Tutor', icon: <MessageSquare className="w-5 h-5" />, href: '/chat' },
    { name: 'Profile', icon: <User className="w-5 h-5" />, href: '/profile' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19] text-slate-200">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-3xl flex flex-col h-full shrink-0 relative z-50 shadow-2xl"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Sleek.ai</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menu.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  active 
                    ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}>
                  <div className="relative z-10">{item.icon}</div>
                  <span className="text-sm relative z-10">{item.name}</span>
                  {active && (
                    <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded-r-full" />
                  )}
                  {!active && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2 bg-black/20 backdrop-blur-xl shrink-0">
          <Link href="/settings">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === '/settings' ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </div>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium border border-transparent hover:border-red-500/20">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative flex flex-col bg-[#0B0F19] custom-scrollbar">
        <div className="flex-1 min-h-0 flex flex-col relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col relative"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
