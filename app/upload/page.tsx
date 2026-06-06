'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Upload as UploadIcon, Sparkles, Brain, Clock, 
  Target, Calendar, TrendingUp, CheckCircle2, ChevronRight, 
  FileText, Activity, Layers, CalendarDays
} from 'lucide-react';
import { syllabusAPI } from '@/lib/api';

const stagger: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function UploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    semester: '',
    content: '',
  });
  
  // Goals State
  const [goals, setGoals] = useState({
    examDate: '',
    dailyHours: 2,
    weeklyDays: 5,
    targetScore: 'A'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Goals & Preview

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfjsLib = await new Promise<any>((resolve, reject) => {
            if ((window as any).pdfjsLib) {
              resolve((window as any).pdfjsLib);
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
              (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              resolve((window as any).pdfjsLib);
            };
            script.onerror = () => reject(new Error('Failed to load pdf.js'));
            document.head.appendChild(script);
          });

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          setFormData({ ...formData, content: fullText });
        } catch (err) {
          console.error('Error parsing PDF:', err);
          setError('Failed to extract text from PDF. Please ensure it is a valid text-based PDF.');
        }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData({ ...formData, content: event.target?.result as string });
        };
        reader.readAsText(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.title || !formData.subject || !formData.content) {
        setError('Please fill all required fields');
        return;
      }
      setStep(2);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await syllabusAPI.upload(formData.title, formData.subject, formData.content, formData.semester);
      const courseResult = await syllabusAPI.createCourse(result.syllabus._id, formData.title);
      router.push(`/course/${courseResult.course._id}`);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 overflow-hidden relative selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-fuchsia-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 w-fit transition text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5">
            <div className="w-full h-full bg-[#131825] rounded-[14px] flex items-center justify-center">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">AI Learning Hub</h1>
            <p className="text-slate-400 font-medium">Transform your syllabus into a hyper-personalized intelligent study system.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Form Column */}
          <div className="lg:col-span-7">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" /> {error}
                    </div>
                  )}

                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400"/> Course Details</h2>
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">Step 1 of 2</span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Course Title <span className="text-indigo-400">*</span></label>
                        <input
                          type="text"
                          placeholder="e.g., Advanced Mathematics CS101"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Subject <span className="text-indigo-400">*</span></label>
                          <input
                            type="text"
                            placeholder="e.g., Mathematics"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Semester (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g., Fall 2026"
                            value={formData.semester}
                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Upload Syllabus Document <span className="text-indigo-400">*</span></label>
                        <label htmlFor="file-input" className="block w-full border-2 border-dashed border-indigo-500/30 rounded-2xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-500/5 transition-all cursor-pointer bg-black/20 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <UploadIcon className="w-12 h-12 text-indigo-400 mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
                          <input type="file" accept=".txt,.pdf" onChange={handleFileChange} className="hidden" id="file-input" required={!formData.content} />
                          <p className="text-white font-semibold mb-1">Drag and drop your syllabus file here</p>
                          <p className="text-xs text-slate-400">Supported formats: PDF, TXT</p>
                          {formData.content && (
                            <div className="mt-4 flex flex-col items-center gap-2">
                              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4" /> Document loaded ({Math.round(formData.content.length / 1024)} KB)
                              </div>
                              <span className="text-xs text-slate-500 font-medium">{formData.content.length.toLocaleString()} characters extracted</span>
                            </div>
                          )}
                        </label>
                      </div>

                      <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                        Continue to AI Setup <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Target className="w-5 h-5 text-violet-400"/> Goal Setup</h2>
                        <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">Step 2 of 2</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 bg-black/20 p-5 rounded-2xl border border-white/5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Target Exam Date</label>
                          <input type="date" value={goals.examDate} onChange={e => setGoals({...goals, examDate: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-violet-500 transition-all text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Target Score</label>
                          <select value={goals.targetScore} onChange={e => setGoals({...goals, targetScore: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-violet-500 transition-all text-sm">
                            <option value="A+">A+ (90-100%)</option>
                            <option value="A">A (80-89%)</option>
                            <option value="B">B (70-79%)</option>
                            <option value="Pass">Pass</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Daily Study Hours: {goals.dailyHours}h</label>
                          <input type="range" min="1" max="8" value={goals.dailyHours} onChange={e => setGoals({...goals, dailyHours: parseInt(e.target.value)})} className="w-full accent-violet-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Days Per Week: {goals.weeklyDays}d</label>
                          <input type="range" min="1" max="7" value={goals.weeklyDays} onChange={e => setGoals({...goals, weeklyDays: parseInt(e.target.value)})} className="w-full accent-violet-500" />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10">
                          Back
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50">
                          {loading ? (
                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing with Gemini AI...</>
                          ) : (
                            <><Sparkles className="w-5 h-5" /> Generate Intelligent Workspace</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>

          {/* Right Column - AI Previews */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
              
              {/* AI Capabilities Card */}
              <motion.div variants={fadeUp} className="bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-400" /> Gemini AI Analysis Pipeline</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Layers className="w-4 h-4" />, text: "Topic Extraction", color: "text-indigo-400", bg: "bg-indigo-500/10" },
                    { icon: <Activity className="w-4 h-4" />, text: "Difficulty Analysis", color: "text-rose-400", bg: "bg-rose-500/10" },
                    { icon: <Clock className="w-4 h-4" />, text: "Smart Study Plan", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { icon: <Target className="w-4 h-4" />, text: "Quiz Generation", color: "text-amber-400", bg: "bg-amber-500/10" },
                    { icon: <CalendarDays className="w-4 h-4" />, text: "Revision Schedule", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                    { icon: <FileText className="w-4 h-4" />, text: "AI Notes Generator", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>{item.icon}</div>
                      <span className="text-sm font-medium text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Study Plan Preview */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-violet-400" /> Predicted Study Plan</h3>
                  <div className="relative pl-6 border-l-2 border-white/10 space-y-6 mt-6">
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-violet-500 ring-4 ring-[#131825]" />
                      <h4 className="text-sm font-bold text-white">Week 1: Foundations</h4>
                      <p className="text-xs text-slate-400 mt-1">Core concepts & initial topic breakdowns</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-[#131825]" />
                      <h4 className="text-sm font-bold text-white">Week 2: Deep Dive</h4>
                      <p className="text-xs text-slate-400 mt-1">Advanced theories & practice quizzes</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-fuchsia-500 ring-4 ring-[#131825]" />
                      <h4 className="text-sm font-bold text-white">Week 3: Application</h4>
                      <p className="text-xs text-slate-400 mt-1">Problem solving & weak point targeting</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#131825]" />
                      <h4 className="text-sm font-bold text-white">Week 4: Exam Readiness</h4>
                      <p className="text-xs text-slate-400 mt-1">Spaced repetition review & mock exams</p>
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
