'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, BarChart3, MessageSquare, ArrowRight } from 'lucide-react';

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">Sleek</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Master Your Studies with <span className="text-blue-400">AI-Powered Planning</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              Upload your syllabus, get personalized study plans, track revision progress, and ace your exams with intelligent scheduling and AI tutoring.
            </p>
            <div className="flex gap-4">
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-border">
            <div className="grid gap-4">
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="h-4 bg-blue-500/20 rounded mb-3"></div>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="h-4 bg-purple-500/20 rounded mb-3"></div>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-center mb-16 text-balance">Powerful Features for Better Learning</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl p-8 border border-border hover:border-primary transition">
            <Zap className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Smart Scheduling</h3>
            <p className="text-muted-foreground">Intelligent algorithms analyze your syllabus and create optimized study schedules tailored to your learning style.</p>
          </div>
          <div className="bg-card rounded-xl p-8 border border-border hover:border-primary transition">
            <BarChart3 className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Progress Analytics</h3>
            <p className="text-muted-foreground">Track your study progress with detailed analytics, streaks, accuracy rates, and personalized recommendations.</p>
          </div>
          <div className="bg-card rounded-xl p-8 border border-border hover:border-primary transition">
            <MessageSquare className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">AI Tutor</h3>
            <p className="text-muted-foreground">Get instant help from our AI assistant. Ask questions, clarify doubts, and learn at your own pace.</p>
          </div>
          <div className="bg-card rounded-xl p-8 border border-border hover:border-primary transition">
            <BookOpen className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Spaced Repetition</h3>
            <p className="text-muted-foreground">Master topics efficiently with scientifically-proven spaced repetition and revision scheduling.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6 text-balance">Ready to Transform Your Learning?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Join thousands of students who are studying smarter, not harder.
        </p>
        <Link href="/signup">
          <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
            Get Started Free
          </Button>
        </Link>
      </section>

    </main>
  );
}
