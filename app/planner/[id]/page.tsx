'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { studyPlanAPI } from '@/lib/api';

interface StudyPlan {
  _id: string;
  title: string;
  description: string;
  status: string;
  sessions: any[];
  completedSessions: number;
  totalSessions: number;
  dailyHours: number;
  learningStyle: string;
}

export default function PlannerDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await studyPlanAPI.getOne(planId);
        setPlan(data);
      } catch (error) {
        console.error('Error loading plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId]);

  const handleCompleteSession = async (sessionId: string) => {
    if (!plan) return;
    try {
      const updated = await studyPlanAPI.completeSession(planId, sessionId);
      setPlan(updated.studyPlan);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Plan not found</p>
      </div>
    );
  }

  const progress = (plan.completedSessions / plan.totalSessions) * 100;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-fit">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{plan.title}</h1>
          <p className="text-muted-foreground mb-6">{plan.description}</p>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{plan.completedSessions} / {plan.totalSessions} sessions</span>
            </div>
            <div className="bg-muted rounded-full h-3 overflow-hidden border border-border">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Daily Hours</p>
              <p className="text-xl font-bold">{plan.dailyHours}h</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Learning Style</p>
              <p className="text-xl font-bold capitalize">{plan.learningStyle}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Status</p>
              <p className="text-xl font-bold capitalize">{plan.status}</p>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <h2 className="text-2xl font-bold mb-6">Study Sessions</h2>
        <div className="space-y-4">
          {plan.sessions.map((session) => (
            <div
              key={session.id}
              className={`rounded-lg p-6 border transition ${
                session.completed
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-card border-border hover:border-primary'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {session.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {new Date(session.date).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{session.dayOfWeek}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {session.startTime} - {session.endTime}
                </div>
              </div>

              <p className="text-sm text-foreground mb-3">Topics: {session.topics.join(', ')}</p>

              {!session.completed && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleCompleteSession(session.id)}
                >
                  Mark as Complete
                </Button>
              )}
              {session.completed && <p className="text-xs text-green-600 dark:text-green-400">Completed on {new Date(session.completedAt).toLocaleDateString()}</p>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
