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
    const { generateRecommendations } = await import('../services/recommendationService.js');
    const recommendations = generateRecommendations(courses);

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

// Update course
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

    res.json({
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    console.error('[v0] Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
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
