import express from 'express';
import RevisionSchedule from '../models/RevisionSchedule.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateNextReviewDate, updateEasinessFactor } from '../utils/algorithms.js';
import { v4 as uuidv4 } from 'uuid';
import { generateRevisionCards } from '../services/aiService.js';
import Course from '../models/Course.js';
import Syllabus from '../models/Syllabus.js';


const router = express.Router();

// Create revision schedule
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseId, topic, cards } = req.body;

    if (!courseId || !topic) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const revisionCards = (cards || []).map((card) => ({
      id: uuidv4(),
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || 'medium',
      repetitions: 0,
      interval: 1,
      nextReviewDate: new Date(),
      easinessFactor: 2.5,
      lastReviewDate: null,
      quality: 3,
    }));

    const revisionSchedule = new RevisionSchedule({
      courseId,
      userId: req.userId,
      topic,
      revisionCards,
      totalCards: revisionCards.length,
      masteredCards: 0,
      algorithm: 'spaced_repetition',
    });

    await revisionSchedule.save();

    res.status(201).json({
      message: 'Revision schedule created',
      revisionSchedule,
    });
  } catch (error) {
    console.error('[v0] Create revision schedule error:', error);
    res.status(500).json({ error: 'Failed to create revision schedule' });
  }
});

// Generate smart revision schedule automatically using Gemini AI
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { courseId, topic } = req.body;

    if (!courseId || !topic) {
      return res.status(400).json({ error: 'Missing required fields: courseId and topic' });
    }

    // Fetch syllabus context to improve flashcard quality
    let syllabusContext = '';
    const course = await Course.findById(courseId);
    if (course?.syllabusId) {
      const syllabus = await Syllabus.findById(course.syllabusId);
      if (syllabus?.extractedContent?.rawText) {
        syllabusContext = syllabus.extractedContent.rawText;
      }
    }

    // Call Gemini AI to generate contextual flashcards
    const generatedCards = await generateRevisionCards(topic, syllabusContext);

    const revisionCards = generatedCards.map((card) => ({
      id: uuidv4(),
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || 'medium',
      repetitions: 0,
      interval: 1,
      nextReviewDate: new Date(),
      easinessFactor: 2.5,
      lastReviewDate: null,
      quality: 0,
    }));

    const revisionSchedule = new RevisionSchedule({
      courseId,
      userId: req.userId,
      topic,
      revisionCards,
      totalCards: revisionCards.length,
      masteredCards: 0,
      algorithm: 'spaced_repetition',
    });

    await revisionSchedule.save();

    res.status(201).json({
      message: 'AI-powered revision schedule generated successfully',
      revisionSchedule,
    });
  } catch (error) {
    console.error('[v0] Generate smart revision error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate smart revision' });
  }
});

// Get revision schedules for course
router.get('/course/:courseId', authMiddleware, async (req, res) => {
  try {
    const revisionSchedules = await RevisionSchedule.find({
      courseId: req.params.courseId,
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(revisionSchedules);
  } catch (error) {
    console.error('[v0] Get revision schedules error:', error);
    res.status(500).json({ error: 'Failed to get revision schedules' });
  }
});

// Get cards due for review
router.get('/:id/due', authMiddleware, async (req, res) => {
  try {
    const revisionSchedule = await RevisionSchedule.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!revisionSchedule) {
      return res.status(404).json({ error: 'Revision schedule not found' });
    }

    const now = new Date();
    const dueCards = revisionSchedule.revisionCards.filter(
      (card) => card.nextReviewDate <= now && !card.completed
    );

    res.json({
      totalDue: dueCards.length,
      cards: dueCards,
      schedule: revisionSchedule,
    });
  } catch (error) {
    console.error('[v0] Get due cards error:', error);
    res.status(500).json({ error: 'Failed to get due cards' });
  }
});

// Record card review
router.post('/:id/review', authMiddleware, async (req, res) => {
  try {
    const { cardId, quality } = req.body;

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Invalid quality score (0-5)' });
    }

    const revisionSchedule = await RevisionSchedule.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!revisionSchedule) {
      return res.status(404).json({ error: 'Revision schedule not found' });
    }

    const card = revisionSchedule.revisionCards.find((c) => c.id === cardId);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Update card based on quality
    card.quality = quality;
    card.repetitions += 1;
    card.lastReviewDate = new Date();

    // Update easiness factor
    card.easinessFactor = updateEasinessFactor(card.easinessFactor, quality);

    // Calculate next review date
    const { nextReviewDate, interval } = calculateNextReviewDate(card);
    card.nextReviewDate = nextReviewDate;
    card.interval = interval;

    // If mastered (quality >= 4), mark as complete
    if (quality >= 4) {
      revisionSchedule.masteredCards += 1;
    }

    await revisionSchedule.save();

    res.json({
      message: 'Card review recorded',
      card,
      masteredCards: revisionSchedule.masteredCards,
      totalCards: revisionSchedule.totalCards,
    });
  } catch (error) {
    console.error('[v0] Review card error:', error);
    res.status(500).json({ error: 'Failed to record review' });
  }
});

// Delete revision schedule
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const revisionSchedule = await RevisionSchedule.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!revisionSchedule) {
      return res.status(404).json({ error: 'Revision schedule not found' });
    }

    res.json({ message: 'Revision schedule deleted' });
  } catch (error) {
    console.error('[v0] Delete revision schedule error:', error);
    res.status(500).json({ error: 'Failed to delete revision schedule' });
  }
});

export default router;
