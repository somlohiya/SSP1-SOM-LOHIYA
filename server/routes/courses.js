import express from 'express';
import Course from '../models/Course.js';
import StudyPlan from '../models/StudyPlan.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all courses for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('[v0] Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Get AI recommendations based on user history
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });
    
    // Dynamic import to avoid circular dependency if any
    let recommendations = [];
    try {
      const { generateAIRecommendations } = await import('../services/aiService.js');
      const aiRecs = await generateAIRecommendations(courses);
      if (aiRecs?.length) {
        recommendations = aiRecs;
        console.log('[courses] AI recommendations generated', { count: recommendations.length });
      }
    } catch (aiError) {
      console.warn('[courses] AI recommendations failed, using rule-based fallback:', aiError.message);
    }

    if (!recommendations.length) {
      const { generateRecommendations } = await import('../services/recommendationService.js');
      recommendations = generateRecommendations(courses);
    }

    res.json(recommendations);
  } catch (error) {
    console.error('[v0] Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get single course
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.userId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('[v0] Get course error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

// Update course (status, progress, dates)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, progress, startDate, endDate } = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('[courses] Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Toggle topic completion — PATCH /api/courses/:id/topics/:topicMongoId/complete
router.patch('/:id/topics/:topicMongoId/complete', authMiddleware, async (req, res) => {
  try {
    console.log(`[courses] Toggle topic: courseId=${req.params.id} topicId=${req.params.topicMongoId}`);

    const course = await Course.findOne({ _id: req.params.id, userId: req.userId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Find topic by _id or fallback to id
    const topic = course.topics.find(t => 
      t._id.toString() === req.params.topicMongoId || 
      t.id === req.params.topicMongoId
    );
    if (!topic) {
      console.error(`[courses] Topic ${req.params.topicMongoId} not found.`);
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Toggle
    topic.completed = !topic.completed;
    console.log(`[courses] Topic "${topic.name}" → completed: ${topic.completed}`);

    // Recalculate progress
    const totalTopics = course.topics.length;
    const completedCount = course.topics.filter(t => t.completed).length;
    course.progress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    // Auto-update status
    if (course.progress === 100) {
      course.status = 'completed';
    } else if (course.progress > 0) {
      course.status = 'in_progress';
    }

    await course.save();
    console.log(`[courses] Progress updated to ${course.progress}%`);
    res.json({ course });
  } catch (error) {
    console.error('[courses] Toggle topic completion error:', error);
    res.status(500).json({ error: 'Failed to update topic completion' });
  }
});

// Delete course
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Also delete related study plans
    await StudyPlan.deleteMany({ courseId: course._id });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('[v0] Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
