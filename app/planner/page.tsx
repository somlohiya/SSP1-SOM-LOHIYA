'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  BookOpen, 
  Brain, 
  Save, 
  Sparkles, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Target
} from 'lucide-react';
import { studyPlanAPI, courseAPI } from '@/lib/api';

const STEPS = [
  { id: 1, name: 'Plan Details', icon: FileText },
  { id: 2, name: 'Schedule', icon: Calendar },
  { id: 3, name: 'Preferences', icon: Brain },
];

function PlannerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [course, setCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courseId);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dailyHours: 2,
    totalDays: 7,
    startDate: new Date().toISOString().split('T')[0],
    examDate: '',
    learningStyle: 'mixed',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Validation
  const isValid = formData.title.trim().length > 0 && selectedCourseId;

  useEffect(() => {
    if (selectedCourseId) {
      const loadCourse = async () => {
        try {
          const data = await courseAPI.getOne(selectedCourseId);
          setCourse(data);
        } catch (err) {
          console.error('Error loading course:', err);
        }
      };
      loadCourse();
    } else {
      const loadCourses = async () => {
        try {
          const data = await courseAPI.getAll();
          setCourses(data);
        } catch (err) {
          console.error('Error loading courses:', err);
        }
      };
      loadCourses();
    }
  }, [selectedCourseId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!isValid) {
      setError('Please fill in the required fields (Plan Title).');
      return;
    }

    setLoading(true);
    try {
      const result = await studyPlanAPI.create(selectedCourseId!, {
        title: formData.title,
        description: formData.description,
        dailyHours: formData.dailyHours,
        totalDays: formData.totalDays,
        startDate: formData.startDate,
        examDate: formData.examDate,
        learningStyle: formData.learningStyle,
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/planner/${result.studyPlan._id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create study plan');
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // In a real app, this would save to localStorage or a draft endpoint
    alert("Draft saved locally!");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Plan Generated!</h2>
          <p className="text-slate-400">Taking you to your new study schedule...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 relative pb-32">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={courseId ? `/course/${courseId}` : '/dashboard'} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back to {course ? 'Course' : 'Dashboard'}
          </Link>
          {course && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
              <Target className="w-3 h-3 text-indigo-400" />
              {course.name}
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-fuchsia-400" />
              Create Study Plan
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Configure your personalized AI study schedule to optimize your learning path and retention.
            </p>
          </motion.div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center mb-12">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center relative">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 z-10">
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="absolute top-12 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className="w-16 sm:w-24 h-px bg-white/10 mx-2" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 mt-16">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-400">Configuration Error</h4>
                  <p className="text-sm text-red-300/80">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Basic Information */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">Basic Information</h2>
            </div>
            
            <div className="space-y-6">
              {!courseId && (
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Select Course <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedCourseId || ''}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className={`w-full bg-black/40 border ${!selectedCourseId ? 'border-red-500/50' : 'border-indigo-500/50'} text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none`}
                  >
                    <option value="" disabled>Choose a course to create a plan for</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {!selectedCourseId && <p className="text-xs text-red-400 mt-2 ml-1">You must select a course first.</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Plan Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Final Exam Sprint"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-black/40 border ${formData.title.length === 0 ? 'border-white/10' : 'border-indigo-500/50'} text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600`}
                />
                <p className="text-xs text-slate-500 mt-2 ml-1">Give your study plan a memorable name.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Description <span className="text-slate-600 font-normal">(Optional)</span></label>
                <textarea
                  placeholder="What are your main goals for this plan?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 resize-y"
                />
              </div>
            </div>
          </section>

          {/* Step 2: Schedule */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">Schedule & Timing</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Daily Study Hours</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={Number.isNaN(formData.dailyHours) ? '' : formData.dailyHours}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, dailyHours: isNaN(val) ? ('' as any) : val });
                    }}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-1">Hours per day you can commit.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Duration</label>
                <select
                  value={formData.totalDays}
                  onChange={(e) => setFormData({ ...formData, totalDays: parseInt(e.target.value, 10) })}
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none"
                >
                  <option value="7">1 Week (7 Days)</option>
                  <option value="15">2 Weeks (15 Days)</option>
                  <option value="30">1 Month (30 Days)</option>
                  <option value="60">2 Months (60 Days)</option>
                  <option value="90">3 Months (90 Days)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2 ml-1">Total length of the study plan.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Exam Date <span className="text-slate-600 font-normal">(Optional)</span></label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Step 3: Preferences */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">Learning Preferences</h2>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-4">What is your primary learning style?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'mixed', label: 'Mixed', desc: 'A balance of all styles' },
                  { id: 'visual', label: 'Visual', desc: 'Diagrams & videos' },
                  { id: 'auditory', label: 'Auditory', desc: 'Lectures & podcasts' },
                  { id: 'reading', label: 'Reading', desc: 'Books & notes' },
                  { id: 'kinesthetic', label: 'Kinesthetic', desc: 'Practice & doing' },
                ].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, learningStyle: style.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.learningStyle === style.id 
                        ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-white' 
                        : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/30'
                    }`}
                  >
                    <div className="font-bold mb-1">{style.label}</div>
                    <div className="text-xs opacity-70">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Info Card */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 flex gap-4 items-start">
            <Sparkles className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-indigo-300 mb-1">Smart AI Generation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our AI will analyze your course syllabus and automatically distribute topics across your selected timeframe, optimizing for your learning style and daily capacity.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-black/60 backdrop-blur-xl border-t border-white/10 p-4 z-50">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400 hidden sm:block">
            {isValid ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Ready to generate
              </span>
            ) : (
              <span>Fill required fields to continue</span>
            )}
          </div>
          
          <div className="flex w-full sm:w-auto items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-white transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                !isValid || loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-400 hover:to-fuchsia-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate AI Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-indigo-400"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PlannerForm />
    </Suspense>
  );
}
