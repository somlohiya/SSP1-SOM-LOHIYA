import express from 'express';
import User from '../models/User.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { isValidEmail } from '../utils/helpers.js';
import Course from '../models/Course.js';
import Syllabus from '../models/Syllabus.js';
import PerformanceMetrics from '../models/PerformanceMetrics.js';
import RevisionSchedule from '../models/RevisionSchedule.js';
import ChatHistory from '../models/ChatHistory.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[v0] Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[v0] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    console.error('[v0] Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user preferences
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { preferences, name, avatar, college, branch, gradYear, bio, github, linkedin, portfolio } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (college !== undefined) user.college = college;
    if (branch !== undefined) user.branch = branch;
    if (gradYear !== undefined) user.gradYear = gradYear;
    if (bio !== undefined) user.bio = bio;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (portfolio !== undefined) user.portfolio = portfolio;

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[v0] Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get profile stats (aggregated real data)
router.get('/profile-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Parallel fetch all data
    const [courses, syllabi, revisionSchedules, chatHistories, allMetrics] = await Promise.all([
      Course.find({ userId }),
      Syllabus.find({ userId }),
      RevisionSchedule.find({ userId }),
      ChatHistory.find({ userId }),
      PerformanceMetrics.find({ userId }),
    ]);

    // Compute stats
    const totalCourses = courses.length;
    const totalTopics = courses.reduce((sum, c) => sum + (c.topics?.length || 0), 0);
    const completedTopics = courses.reduce((sum, c) => {
      const topics = c.topics || [];
      return sum + topics.filter(t => t.completed).length;
    }, 0);
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Study hours from all metrics
    const totalStudyHours = allMetrics.reduce((sum, m) => sum + (m.overallStats?.totalStudyHours || 0), 0);

    // Revision / quiz data
    const totalReviews = allMetrics.reduce((sum, m) => sum + (m.overallStats?.totalReviews || 0), 0);

    // AI sessions = chat messages count
    const aiSessions = chatHistories.length;

    // Notes = syllabi * rough multiplier (syllabi uploaded)
    const notesGenerated = syllabi.length;

    // Streak — max across all courses
    const maxStreak = allMetrics.reduce((max, m) => Math.max(max, m.overallStats?.currentStreak || 0), 0);

    // Performance chart — last 6 months of daily stats aggregated
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const performanceMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      performanceMap[key] = { month: months[d.getMonth()], hours: 0, topics: 0, sessions: 0 };
    }
    allMetrics.forEach(m => {
      (m.dailyStats || []).forEach(stat => {
        const d = new Date(stat.date);
        const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
        if (performanceMap[key]) {
          performanceMap[key].hours += stat.studyHours || 0;
          performanceMap[key].topics += stat.topicsReviewed || 0;
          performanceMap[key].sessions += 1;
        }
      });
    });
    const performanceData = Object.values(performanceMap);

    // Heatmap — last 119 days
    const heatmapMap = {};
    allMetrics.forEach(m => {
      (m.dailyStats || []).forEach(stat => {
        const d = new Date(stat.date);
        d.setHours(0,0,0,0);
        const key = d.toISOString().split('T')[0];
        if (!heatmapMap[key]) heatmapMap[key] = 0;
        heatmapMap[key] += stat.studyHours || 0;
      });
    });
    const heatmap = Array.from({ length: 119 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (118 - i));
      d.setHours(0,0,0,0);
      const key = d.toISOString().split('T')[0];
      const hrs = heatmapMap[key] || 0;
      const intensity = hrs === 0 ? 0 : hrs < 1 ? 1 : hrs < 2 ? 2 : hrs < 4 ? 3 : 4;
      return { date: d, intensity };
    });

    res.json({
      stats: {
        totalCourses,
        completedTopics,
        totalTopics,
        totalStudyHours: Math.round(totalStudyHours),
        quizAttempts: totalReviews,
        notesGenerated,
        aiSessions,
        overallProgress,
      },
      streak: maxStreak,
      performanceData,
      heatmap,
    });
  } catch (error) {
    console.error('[v0] Profile stats error:', error);
    res.status(500).json({ error: 'Failed to get profile stats' });
  }
});

export default router;

