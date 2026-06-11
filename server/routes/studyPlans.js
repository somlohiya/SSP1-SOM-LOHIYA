import express from 'express';
import StudyPlan from '../models/StudyPlan.js';
import Course from '../models/Course.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateStudySession } from '../utils/algorithms.js';
import { generateStudyPlanSessions } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create study plan
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseId, title, description, dailyHours, totalDays, learningStyle, weeklyPattern, startDate, examDate } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Extract actual topics from the course
    const topics = course.topics && course.topics.length > 0 
      ? course.topics.map((t) => t.name) 
      : [course.name];

    let sessions = generateStudySession(topics, dailyHours || 2, course.totalEstimatedHours || 20, totalDays || 4, startDate);

    // Enhance with AI-generated daily focus when Gemini is available
    try {
      const aiPlan = await generateStudyPlanSessions(
        topics,
        dailyHours || 2,
        totalDays || sessions.length,
        learningStyle || 'mixed'
      );
      if (aiPlan?.length) {
        const start = startDate ? new Date(startDate) : new Date();
        sessions = sessions.map((session, index) => {
          const aiDay = aiPlan[Math.min(index, aiPlan.length - 1)];
          return {
            ...session,
            aiFocus: aiDay?.focus || null,
            aiActivities: aiDay?.activities || [],
          };
        });
        console.log('[study-plans] AI session enrichment applied', { days: aiPlan.length });
      }
    } catch (aiError) {
      console.warn('[study-plans] AI enrichment skipped, using algorithmic schedule:', aiError.message);
    }

    const studyPlan = new StudyPlan({
      courseId,
      userId: req.userId,
      title,
      description,
      sessions: sessions.map((session) => ({
        ...session,
        id: uuidv4(),
      })),
      totalSessions: sessions.length,
      completedSessions: 0,
      dailyHours: dailyHours || 2,
      totalDays: totalDays || 4,
      learningStyle: learningStyle || 'mixed',
      weeklyPattern: weeklyPattern || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      startDate,
      endDate: sessions.length > 0 ? sessions[sessions.length - 1].date : null,
      examDate,
      status: 'created',
    });

    await studyPlan.save();

    res.status(201).json({
      message: 'Study plan created successfully',
      studyPlan,
    });
  } catch (error) {
    console.error('[v0] Create study plan error:', error);
    res.status(500).json({ error: 'Failed to create study plan' });
  }
});

// Get study plans for course
router.get('/course/:courseId', authMiddleware, async (req, res) => {
  try {
    const studyPlans = await StudyPlan.find({
      courseId: req.params.courseId,
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(studyPlans);
  } catch (error) {
    console.error('[v0] Get study plans error:', error);
    res.status(500).json({ error: 'Failed to get study plans' });
  }
});

// Get single study plan
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({ _id: req.params.id, userId: req.userId });

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    res.json(studyPlan);
  } catch (error) {
    console.error('[v0] Get study plan error:', error);
    res.status(500).json({ error: 'Failed to get study plan' });
  }
});

// Update study plan
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, description, dailyHours } = req.body;

    const studyPlan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        ...(status && { status }),
        ...(description && { description }),
        ...(dailyHours && { dailyHours }),
      },
      { new: true }
    );

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    res.json({
      message: 'Study plan updated successfully',
      studyPlan,
    });
  } catch (error) {
    console.error('[v0] Update study plan error:', error);
    res.status(500).json({ error: 'Failed to update study plan' });
  }
});

// Mark session as complete
router.patch('/:id/sessions/:sessionId/complete', authMiddleware, async (req, res) => {
  try {
    const { notes } = req.body;

    const studyPlan = await StudyPlan.findOne({ _id: req.params.id, userId: req.userId });

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    const session = studyPlan.sessions.find(
      (s) => s._id?.toString() === req.params.sessionId || s.id === req.params.sessionId
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.completed = true;
    session.completedAt = new Date();
    if (notes) session.notes = notes;

    studyPlan.completedSessions = studyPlan.sessions.filter((s) => s.completed).length;

    await studyPlan.save();

    res.json({
      message: 'Session marked as complete',
      studyPlan,
    });
  } catch (error) {
    console.error('[v0] Complete session error:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// Delete study plan
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    res.json({ message: 'Study plan deleted successfully' });
  } catch (error) {
    console.error('[v0] Delete study plan error:', error);
    res.status(500).json({ error: 'Failed to delete study plan' });
  }
});

export default router;
