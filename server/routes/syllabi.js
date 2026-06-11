import express from 'express';
import Syllabus from '../models/Syllabus.js';
import Course from '../models/Course.js';
import { authMiddleware } from '../middleware/auth.js';
import { extractTopicsFromText, estimateStudyHours } from '../utils/helpers.js';
import { extractTopicsWithAI } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Upload syllabus
router.post('/upload', authMiddleware, async (req, res) => {
  try {
    const { title, subject, semester, content } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('[syllabi] Incoming upload', { title, subject, contentLength: content.length });
    let topics = await extractTopicsWithAI(content);
    let aiAnalyzed = true;
    if (!topics || topics.length === 0) {
      console.log('[syllabi] Gemini unavailable or returned no topics, using regex fallback');
      topics = extractTopicsFromText(content);
      aiAnalyzed = false;
    }
    const estimatedHours = estimateStudyHours(content, topics.length);

    const syllabus = new Syllabus({
      userId: req.userId,
      title,
      subject,
      semester,
      extractedContent: {
        rawText: content,
        topics,
        estimatedStudyHours: estimatedHours,
      },
      status: 'processed',
    });

    await syllabus.save();

    res.status(201).json({
      message: aiAnalyzed
        ? 'Syllabus uploaded and analyzed by AI successfully'
        : 'Syllabus uploaded (regex topic extraction — configure GEMINI_API_KEY for AI analysis)',
      syllabus,
      aiAnalyzed,
    });
  } catch (error) {
    console.error('[v0] Upload syllabus error:', error);
    res.status(500).json({ error: 'Failed to upload syllabus' });
  }
});


// Get all syllabi for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const syllabi = await Syllabus.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(syllabi);
  } catch (error) {
    console.error('[v0] Get syllabi error:', error);
    res.status(500).json({ error: 'Failed to get syllabi' });
  }
});

// Get single syllabus
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const syllabus = await Syllabus.findOne({ _id: req.params.id, userId: req.userId });

    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    res.json(syllabus);
  } catch (error) {
    console.error('[v0] Get syllabus error:', error);
    res.status(500).json({ error: 'Failed to get syllabus' });
  }
});

// Create course from syllabus
router.post('/:id/create-course', authMiddleware, async (req, res) => {
  try {
    const { courseName } = req.body;

    const syllabus = await Syllabus.findOne({ _id: req.params.id, userId: req.userId });

    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    // Create course from syllabus
    const topics = syllabus.extractedContent.topics.map((topic) => ({
      id: uuidv4(),
      name: topic.name,
      description: topic.description,
      subtopics: [],
      estimatedHours: Math.ceil(
        (syllabus.extractedContent.estimatedStudyHours * topic.weight) / Math.max(1, syllabus.extractedContent.topics.length)
      ),
      difficulty: 'medium',
    }));

    const course = new Course({
      syllabusId: syllabus._id,
      userId: req.userId,
      name: courseName || syllabus.title,
      description: syllabus.description,
      topics,
      totalEstimatedHours: syllabus.extractedContent.estimatedStudyHours,
      status: 'not_started',
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('[v0] Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Delete syllabus
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const syllabus = await Syllabus.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    res.json({ message: 'Syllabus deleted successfully' });
  } catch (error) {
    console.error('[v0] Delete syllabus error:', error);
    res.status(500).json({ error: 'Failed to delete syllabus' });
  }
});

export default router;
