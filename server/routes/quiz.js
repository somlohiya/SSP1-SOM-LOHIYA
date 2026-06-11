import express from 'express';
import Quiz from '../models/Quiz.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateQuiz } from '../services/aiService.js';
import Course from '../models/Course.js';
import Syllabus from '../models/Syllabus.js';

const router = express.Router();

// Generate a new quiz using Gemini AI
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { courseId, topic, difficulty, numQuestions } = req.body;

    if (!courseId || !topic) {
      return res.status(400).json({ error: 'Missing required fields: courseId and topic' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Fetch syllabus context to improve quiz quality
    let syllabusContext = '';
    if (course.syllabusId) {
      const syllabus = await Syllabus.findById(course.syllabusId);
      if (syllabus?.extractedContent?.rawText) {
        syllabusContext = syllabus.extractedContent.rawText;
      }
    }

    console.log('[quiz] Generate request', { courseId, topic, difficulty, numQuestions });
    const generatedQuestions = await generateQuiz(topic, syllabusContext, { difficulty, numQuestions });

    const quiz = new Quiz({
      userId: req.userId,
      courseId,
      topic,
      questions: generatedQuestions,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error('[v0] Generate quiz error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// Get quizzes for a course
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.userId,
      courseId: req.params.courseId
    }).sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('[v0] Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Submit a quiz score
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { score } = req.body;

    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { score, completedAt: new Date() },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('[v0] Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

export default router;
