import express from 'express';
import { checkAIHealth } from '../services/aiService.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  console.log('[AI] Health check requested');
  try {
    const result = await checkAIHealth();
    const statusCode = result.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('[AI] Health check error:', error.message, error.stack);
    res.status(503).json({ status: 'error', message: error.message });
  }
});

export default router;
