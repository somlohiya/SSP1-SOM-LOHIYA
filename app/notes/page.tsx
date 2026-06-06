'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowLeft, Download, Sparkles, Copy, CheckCircle2, Save } from 'lucide-react';
import { notesAPI, courseAPI } from '@/lib/api';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function NotesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('detailed');
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    courseAPI.getAll().then(setCourses).catch(console.error);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !topic) return;
    setLoading(true);
    setNote(null);
    try {
      const generated = await notesAPI.generate(selectedCourse, topic, type);
      setNote(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!note) return;
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.topic}-notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!note) return;
    navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 md:p-8 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <nav className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 w-fit transition text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </nav>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-0.5">
            <div className="w-full h-full bg-[#131825] rounded-[14px] flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">AI Notes Generator</h1>
            <p className="text-slate-400 font-medium">Generate structured, high-yield study materials instantly.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-4">
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl">
              <form onSubmit={handleGenerate} className="space-y-5">
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
                    placeholder="e.g. Thermodynamics, Graph Theory..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm placeholder:text-slate-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Note Type</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'short', label: 'Short Notes', desc: 'Concise bullet points' },
                      { id: 'detailed', label: 'Detailed Notes', desc: 'Comprehensive guide' },
                      { id: 'revision', label: 'Revision Notes', desc: 'Exam focused review' }
                    ].map(t => (
                      <label key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${type === t.id ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                        <input type="radio" name="noteType" value={t.id} checked={type === t.id} onChange={(e) => setType(e.target.value)} className="mt-1 accent-indigo-500" />
                        <div>
                          <p className={`text-sm font-bold ${type === t.id ? 'text-indigo-400' : 'text-slate-300'}`}>{t.label}</p>
                          <p className="text-xs text-slate-500">{t.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 mt-4">
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Synthesizing Notes...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Generate AI Notes</>
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
                    <Sparkles className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-2 text-center w-full max-w-md">
                    <div className="h-4 bg-white/10 rounded-full w-3/4 mx-auto animate-pulse" />
                    <div className="h-4 bg-white/10 rounded-full w-1/2 mx-auto animate-pulse" />
                    <div className="h-4 bg-white/10 rounded-full w-5/6 mx-auto animate-pulse" />
                  </div>
                  <p className="text-indigo-400 font-medium animate-pulse">Extracting Key Concepts & Definitions...</p>
                </motion.div>
              )}

              {!loading && !note && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[600px] bg-white/5 border border-white/10 border-dashed rounded-3xl p-12 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="w-10 h-10 text-indigo-500/50" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">Ready to Generate</h3>
                  <p className="text-slate-500 max-w-sm">Select your course parameters on the left to instantly generate beautiful, structured Markdown notes.</p>
                </motion.div>
              )}

              {!loading && note && (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-1 backdrop-blur-xl h-full flex flex-col">
                  <div className="bg-[#131825] rounded-[22px] p-6 flex flex-col h-full relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{note.topic}</h2>
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md uppercase tracking-wider">{note.type} Notes</span>
                          <span className="text-slate-500">Generated by Gemini AI</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all border border-white/5">
                          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />} 
                          {copied ? <span className="text-emerald-400">Copied!</span> : 'Copy'}
                        </button>
                        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-semibold transition-all">
                          <Download className="w-4 h-4" /> Download PDF/MD
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold transition-all">
                          <Save className="w-4 h-4" /> Save to Course
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                      <div className="prose prose-invert prose-indigo max-w-none">
                        {/* We use basic whitespace-pre-wrap for now, ideally this would be a ReactMarkdown component */}
                        <div className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
                          {note.content}
                        </div>
                      </div>

                      {note.importantQuestions && note.importantQuestions.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-white/10">
                          <h3 className="flex items-center gap-2 text-lg font-bold text-fuchsia-400 mb-4">
                            <Sparkles className="w-5 h-5" /> Important Exam Questions
                          </h3>
                          <div className="grid gap-3">
                            {note.importantQuestions.map((q: string, i: number) => (
                              <div key={i} className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl p-4 flex gap-4">
                                <span className="text-fuchsia-500 font-bold bg-fuchsia-500/10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">Q{i+1}</span>
                                <p className="text-slate-300 text-sm leading-relaxed pt-1">{q}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </main>
  );
}
