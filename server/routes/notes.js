import express from 'express';
import Note from '../models/Note.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateNotes } from '../services/aiService.js';
import Course from '../models/Course.js';
import Syllabus from '../models/Syllabus.js';

const router = express.Router();

// Generate notes using Gemini AI
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { courseId, topic, type } = req.body;

    if (!courseId || !topic || !type) {
      return res.status(400).json({ error: 'Missing required fields: courseId, topic, type' });
    }

    if (!['short', 'detailed', 'revision'].includes(type)) {
      return res.status(400).json({ error: 'type must be one of: short, detailed, revision' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Fetch syllabus context to improve note quality
    let syllabusContext = '';
    if (course.syllabusId) {
      const syllabus = await Syllabus.findById(course.syllabusId);
      if (syllabus?.extractedContent?.rawText) {
        syllabusContext = syllabus.extractedContent.rawText;
      }
    }

    const generated = await generateNotes(topic, type, syllabusContext);

    const note = new Note({
      userId: req.userId,
      courseId,
      topic,
      type,
      content: generated.content,
      importantQuestions: generated.importantQuestions,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('[v0] Generate notes error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate notes' });
  }
});

// Get notes for a course
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.userId,
      courseId: req.params.courseId
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('[v0] Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

export default router;
