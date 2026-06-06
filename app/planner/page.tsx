'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus } from 'lucide-react';
import { studyPlanAPI, courseAPI } from '@/lib/api';

function PlannerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [course, setCourse] = useState<any>(null);
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

  useEffect(() => {
    if (courseId) {
      const loadCourse = async () => {
        try {
          const data = await courseAPI.getOne(courseId);
          setCourse(data);
        } catch (err) {
          console.error('Error loading course:', err);
        }
      };
      loadCourse();
    }
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!courseId || !formData.title) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await studyPlanAPI.create(courseId, {
        title: formData.title,
        description: formData.description,
        dailyHours: formData.dailyHours,
        totalDays: formData.totalDays,
        startDate: formData.startDate,
        examDate: formData.examDate,
        learningStyle: formData.learningStyle,
      });
      router.push(`/planner/${result.studyPlan._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create study plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={courseId ? `/course/${courseId}` : '/dashboard'} className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">Create Study Plan</h1>
        <p className="text-muted-foreground mb-8">{course ? `For: ${course.name}` : 'Create a personalized study plan'}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Plan Title *</label>
            <Input
              type="text"
              placeholder="e.g., Week 1 Study Plan"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-input border-border text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              placeholder="Add notes about this study plan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-input border border-border text-foreground rounded-lg p-3 min-h-24 focus:outline-none focus:border-ring"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Daily Study Hours</label>
              <Input
                type="number"
                min="1"
                max="8"
                step="0.5"
                value={Number.isNaN(formData.dailyHours) ? '' : formData.dailyHours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, dailyHours: isNaN(val) ? ('' as any) : val });
                }}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total Study Days</label>
              <select
                value={formData.totalDays}
                onChange={(e) => setFormData({ ...formData, totalDays: parseInt(e.target.value, 10) })}
                className="w-full bg-input border border-border text-foreground rounded-lg p-2.5 h-10 focus:outline-none focus:border-ring"
              >
                <option value="7">7 Days</option>
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-input border-border text-foreground block w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Exam Date (Optional)</label>
              <Input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="bg-input border-border text-foreground block w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Learning Style</label>
              <select
                value={formData.learningStyle}
                onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value })}
                className="w-full bg-input border border-border text-foreground rounded-lg p-2.5 h-10 focus:outline-none focus:border-ring"
              >
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="reading">Reading/Writing</option>
                <option value="kinesthetic">Kinesthetic</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="font-semibold mb-3">Smart Scheduling</h3>
            <p className="text-muted-foreground text-sm">
              Our intelligent algorithm will create personalized study sessions based on your daily availability and learning style. Sessions will be optimized for better retention.
            </p>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            {loading ? 'Creating Plan...' : 'Create Study Plan'}
          </Button>
        </form>
      </div>
    </main>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading planner...</div>}>
      <PlannerForm />
    </Suspense>
  );
}
