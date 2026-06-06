import express from 'express';
import PerformanceMetrics from '../models/PerformanceMetrics.js';
import RevisionSchedule from '../models/RevisionSchedule.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateStreak } from '../utils/algorithms.js';
import { generateInsights, predictNextMilestone, getWeakAreas, calculateOptimalStudyTime } from '../services/analyticsService.js';

const router = express.Router();

// Get or create metrics for course
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    let metrics = await PerformanceMetrics.findOne({
      userId: req.userId,
      courseId: req.params.courseId,
    });

    if (!metrics) {
      metrics = new PerformanceMetrics({
        userId: req.userId,
        courseId: req.params.courseId,
        dailyStats: [],
        weeklyStats: [],
        monthlyStats: [],
        overallStats: {
          totalStudyHours: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageAccuracy: 0,
          topicsCompleted: 0,
          totalReviews: 0,
        },
      });
      await metrics.save();
    }

    res.json(metrics);
  } catch (error) {
    console.error('[v0] Get metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Record daily study session
router.post('/:courseId/daily-session', authMiddleware, async (req, res) => {
  try {
    const { studyHours, topicsReviewed, cardsReviewed, cardsCorrect } = req.body;

    const metrics = await PerformanceMetrics.findOne({
      userId: req.userId,
      courseId: req.params.courseId,
    });

    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found' });
    }

    const accuracy = cardsReviewed > 0 ? (cardsCorrect / cardsReviewed) * 100 : 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if we already have a session for today
    const existingIndex = metrics.dailyStats.findIndex((stat) => {
      const statDate = new Date(stat.date);
      statDate.setHours(0, 0, 0, 0);
      return statDate.getTime() === today.getTime();
    });

    if (existingIndex >= 0) {
      // Update existing session
      metrics.dailyStats[existingIndex].studyHours += studyHours;
      metrics.dailyStats[existingIndex].topicsReviewed += topicsReviewed;
      metrics.dailyStats[existingIndex].cardsReviewed += cardsReviewed;
      metrics.dailyStats[existingIndex].cardsCorrect += cardsCorrect;
      metrics.dailyStats[existingIndex].accuracy =
        (metrics.dailyStats[existingIndex].cardsCorrect / metrics.dailyStats[existingIndex].cardsReviewed) * 100;
    } else {
      // Add new session
      metrics.dailyStats.push({
        date: today,
        studyHours,
        topicsReviewed,
        cardsReviewed,
        cardsCorrect,
        accuracy,
      });
    }

    // Update overall stats
    metrics.overallStats.totalStudyHours += studyHours;
    metrics.overallStats.totalReviews += cardsReviewed;

    // Calculate streak
    const { currentStreak, longestStreak } = calculateStreak(metrics.dailyStats);
    metrics.overallStats.currentStreak = currentStreak;
    metrics.overallStats.longestStreak = Math.max(metrics.overallStats.longestStreak, longestStreak);

    await metrics.save();

    res.json({
      message: 'Session recorded',
      metrics,
    });
  } catch (error) {
    console.error('[v0] Record session error:', error);
    res.status(500).json({ error: 'Failed to record session' });
  }
});

// Get progress summary
router.get('/:courseId/summary', authMiddleware, async (req, res) => {
  try {
    let metrics = await PerformanceMetrics.findOne({
      userId: req.userId,
      courseId: req.params.courseId,
    });

    // Auto-create blank metrics if none exist yet (new course)
    if (!metrics) {
      metrics = new PerformanceMetrics({
        userId: req.userId,
        courseId: req.params.courseId,
        dailyStats: [],
        weeklyStats: [],
        monthlyStats: [],
        overallStats: {
          totalStudyHours: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageAccuracy: 0,
          topicsCompleted: 0,
          totalReviews: 0,
        },
      });
      await metrics.save();
    }

    const totalDays = metrics.dailyStats.length;
    const avgDailyStudy = totalDays > 0 ? metrics.overallStats.totalStudyHours / totalDays : 0;
    const avgAccuracy =
      metrics.dailyStats.length > 0
        ? metrics.dailyStats.reduce((sum, stat) => sum + stat.accuracy, 0) / metrics.dailyStats.length
        : 0;

    res.json({
      totalStudyHours: metrics.overallStats.totalStudyHours,
      currentStreak: metrics.overallStats.currentStreak,
      longestStreak: metrics.overallStats.longestStreak,
      averageAccuracy: avgAccuracy.toFixed(2),
      avgDailyStudy: avgDailyStudy.toFixed(2),
      totalSessions: totalDays,
      totalReviews: metrics.overallStats.totalReviews,
      topicsCompleted: metrics.overallStats.topicsCompleted,
      dailyStats: metrics.dailyStats.slice(-30), // Last 30 days
    });
  } catch (error) {
    console.error('[v0] Get summary error:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});


// Get insights and recommendations
router.get('/:courseId/insights', authMiddleware, async (req, res) => {
  try {
    const metrics = await PerformanceMetrics.findOne({
      userId: req.userId,
      courseId: req.params.courseId,
    });

    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found' });
    }

    const insights = generateInsights(metrics.overallStats, metrics.dailyStats);
    const milestone = predictNextMilestone(metrics.overallStats, metrics.dailyStats);
    const optimalTime = calculateOptimalStudyTime(metrics.dailyStats);

    const revisionSchedules = await RevisionSchedule.find({
      userId: req.userId,
      courseId: req.params.courseId,
    });

    const weakAreas = getWeakAreas(revisionSchedules);

    res.json({
      insights,
      nextMilestone: milestone,
      optimalStudyTime: optimalTime,
      weakAreas,
    });
  } catch (error) {
    console.error('[v0] Get insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// Get study recommendations
router.get('/:courseId/recommendations', authMiddleware, async (req, res) => {
  try {
    const metrics = await PerformanceMetrics.findOne({
      userId: req.userId,
      courseId: req.params.courseId,
    });

    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found' });
    }

    const recommendations = [];

    // Recommendation 1: Study time
    if (metrics.overallStats.totalStudyHours < 10) {
      recommendations.push({
        priority: 'high',
        title: 'Increase Study Time',
        description: "You haven't studied much yet. Try to dedicate at least 1-2 hours daily.",
      });
    }

    // Recommendation 2: Consistency
    if (metrics.overallStats.currentStreak === 0) {
      recommendations.push({
        priority: 'high',
        title: 'Start a Study Streak',
        description: 'Study today to begin building your daily learning habit.',
      });
    }

    // Recommendation 3: Weak areas
    const revisionSchedules = await RevisionSchedule.find({
      userId: req.userId,
      courseId: req.params.courseId,
    });

    const lowScoreTopics = revisionSchedules
      .filter((r) => r.masteredCards < r.totalCards / 2)
      .slice(0, 3);

    if (lowScoreTopics.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Focus on Weak Areas',
        description: `Review these topics: ${lowScoreTopics.map((t) => t.topic).join(', ')}`,
      });
    }

    // Recommendation 4: Accuracy
    if (metrics.dailyStats.length > 0) {
      const avgAccuracy = metrics.dailyStats.reduce((sum, s) => sum + s.accuracy, 0) / metrics.dailyStats.length;
      if (avgAccuracy < 60) {
        recommendations.push({
          priority: 'high',
          title: 'Improve Understanding',
          description: 'Your accuracy is below 60%. Review core concepts before practicing.',
        });
      }
    }

    res.json(recommendations);
  } catch (error) {
    console.error('[v0] Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;
