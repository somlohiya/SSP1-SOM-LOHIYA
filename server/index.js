import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import syllabusRoutes from './routes/syllabi.js';
import courseRoutes from './routes/courses.js';
import studyPlanRoutes from './routes/studyPlans.js';
import revisionRoutes from './routes/revision.js';
import analyticsRoutes from './routes/analytics.js';
import chatRoutes from './routes/chat.js';
import quizRoutes from './routes/quiz.js';
import notesRoutes from './routes/notes.js';

dotenv.config();

// ── Startup validation ────────────────────────────────────────────────────────
const geminiKey = process.env.GEMINI_API_KEY;

if (!geminiKey) {
  console.error('[STARTUP] ❌ GEMINI_API_KEY is missing from server/.env');
} else {
  console.log('[STARTUP] ✅ GEMINI_API_KEY loaded. Prefix:', geminiKey.substring(0, 10));
}
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to database
connectDB();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/syllabi', syllabusRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/notes', notesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[v0] Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`[v0] Server running on http://localhost:${PORT}`);
  console.log('[v0] Available routes:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  PATCH  /api/auth/me');
  console.log('  POST   /api/syllabi/upload');
  console.log('  GET    /api/syllabi');
  console.log('  GET    /api/courses');
  console.log('  POST   /api/study-plans');
  console.log('  POST   /api/revision');
  console.log('  GET    /api/analytics/:courseId');
  console.log('  POST   /api/chat');
});

export default app;
