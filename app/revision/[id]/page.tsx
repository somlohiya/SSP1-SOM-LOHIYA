'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { revisionAPI } from '@/lib/api';

interface RevisionCard {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  nextReviewDate: string;
  repetitions: number;
}

interface RevisionSchedule {
  _id: string;
  topic: string;
  revisionCards: RevisionCard[];
  masteredCards: number;
  totalCards: number;
}

export default function RevisionDetailPage() {
  const params = useParams();
  const scheduleId = params.id as string;
  const [schedule, setSchedule] = useState<RevisionSchedule | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dueCards, setDueCards] = useState<any>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await revisionAPI.getDueCards(scheduleId);
        setDueCards(data);
        setSchedule(data.schedule);
      } catch (error) {
        console.error('Error loading schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [scheduleId]);

  const handleReview = async (quality: number) => {
    if (!dueCards || !dueCards.cards[currentCardIndex]) return;

    try {
      const card = dueCards.cards[currentCardIndex];
      const result = await revisionAPI.reviewCard(scheduleId, card.id, quality);

      // Move to next card or reload if done
      if (currentCardIndex + 1 < dueCards.cards.length) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        // Reload to get fresh data
        const updated = await revisionAPI.getDueCards(scheduleId);
        setDueCards(updated);
        setSchedule(updated.schedule);
        setCurrentCardIndex(0);
      }
    } catch (error) {
      console.error('Error reviewing card:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Schedule not found</p>
      </div>
    );
  }

  const dueCardsCount = dueCards?.totalDue || 0;
  const masteredCount = schedule.masteredCards;
  const progressPercent = (masteredCount / schedule.totalCards) * 100;

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
          <h1 className="text-4xl font-bold mb-4">Revision: {schedule.topic}</h1>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Mastered</span>
              <span className="font-semibold">{masteredCount} / {schedule.totalCards}</span>
            </div>
            <div className="bg-muted rounded-full h-3 overflow-hidden border border-border">
              <div className="bg-green-500 h-full transition-all" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Cards Due for Review</p>
              <p className="text-2xl font-bold">{dueCardsCount}</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <p className="text-muted-foreground text-sm mb-1">Total Cards</p>
              <p className="text-2xl font-bold">{schedule.totalCards}</p>
            </div>
          </div>
        </div>

        {/* Flashcard Study */}
        {dueCardsCount > 0 && dueCards?.cards.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Study Cards</h2>
              <span className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {dueCards.cards.length}
              </span>
            </div>

            {/* Flashcard */}
            <div className="mb-8">
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full bg-gradient-to-br rounded-2xl p-12 min-h-96 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition border border-border shadow-md ${
                  !isFlipped ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'
                }`}
              >
                <div className="mb-4">
                  {!isFlipped ? (
                    <p className="text-sm text-blue-100 mb-4 font-medium uppercase tracking-wider">Question</p>
                  ) : (
                    <p className="text-sm text-emerald-100 mb-4 font-medium uppercase tracking-wider">Answer</p>
                  )}
                </div>
                <p className="text-3xl font-semibold text-white mb-6 leading-relaxed">
                  {isFlipped ? dueCards.cards[currentCardIndex]?.answer : dueCards.cards[currentCardIndex]?.question}
                </p>
                <p className="text-sm text-white/70">Click to flip</p>
              </button>
            </div>

            {/* Quality Rating */}
            {isFlipped && (
              <div className="mb-8">
                <p className="text-center text-muted-foreground mb-6 font-medium">How well did you remember?</p>
                <div className="grid grid-cols-5 gap-3">
                  <button
                    onClick={() => handleReview(1)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 font-semibold transition shadow-sm"
                  >
                    Again
                  </button>
                  <button
                    onClick={() => handleReview(2)}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-3 font-semibold transition shadow-sm"
                  >
                    Hard
                  </button>
                  <button
                    onClick={() => handleReview(3)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg py-3 font-semibold transition shadow-sm"
                  >
                    Good
                  </button>
                  <button
                    onClick={() => handleReview(4)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition shadow-sm"
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => handleReview(5)}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold transition shadow-sm"
                  >
                    Perfect
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <p className="text-muted-foreground mb-4">No cards due for review today!</p>
            <p className="text-muted-foreground/70">Come back tomorrow for more practice</p>
          </div>
        )}
      </div>
    </main>
  );
}
