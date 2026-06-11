import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('[ENV] Could not load server/.env:', result.error.message);
} else {
  console.log('[ENV] Loaded server/.env from', envPath);
}

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim() || '';
export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sleek-syllabus';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const validateOpenRouterKey = () => {
  if (!OPENROUTER_API_KEY) {
    return { valid: false, reason: 'OPENROUTER_API_KEY is not set in server/.env' };
  }
  return { valid: true, prefix: OPENROUTER_API_KEY.substring(0, 10) };
};
