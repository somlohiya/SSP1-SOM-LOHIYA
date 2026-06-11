import './config/env.js';
import express from 'express';
import cors from 'cors';
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
import aiRoutes from './routes/ai.js';
import { validateOpenRouterKey } from './config/env.js';

const keyStatus = validateOpenRouterKey();
if (!keyStatus.valid) {
  console.error('[STARTUP] ❌', keyStatus.reason);
} else {
  console.log('[STARTUP] ✅ OPENROUTER_API_KEY loaded. Prefix:', keyStatus.prefix);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[API] ${req.method} ${req.path}`, {
      bodyKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : [],
      userId: req.headers.authorization ? '(authenticated)' : '(anonymous)',
    });
  }
  next();
});

connectDB();

app.get('/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/syllabi', syllabusRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, req, res, next) => {
  console.error('[SERVER] Unhandled error:', err.message, err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
  console.log('[SERVER] AI health: GET /api/ai/health');
});

export default app;
