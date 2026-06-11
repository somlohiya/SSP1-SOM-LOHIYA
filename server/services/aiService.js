import OpenAI from 'openai';
import '../config/env.js';

// ─── OpenRouter client (OpenAI-compatible) ───────────────────────────────────
const MODEL = 'deepseek/deepseek-chat-v3-0324';

let openaiClient = null;
let cachedApiKey = null;

const log = (level, message, meta = {}) => {
  const prefix = '[AI]';
  const payload = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  if (level === 'error') console.error(`${prefix} ${message}${payload}`);
  else console.log(`${prefix} ${message}${payload}`);
};

const getClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    log('error', 'OPENROUTER_API_KEY is not set in server/.env');
    throw new Error('OpenRouter API key not configured. Add OPENROUTER_API_KEY to server/.env');
  }
  if (!openaiClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    openaiClient = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Sleek.ai Study Platform',
      },
    });
    log('info', 'OpenRouter client initialized', { keyPrefix: apiKey.substring(0, 12) });
  }
  return openaiClient;
};

// ─── Core text-generation helper ─────────────────────────────────────────────
const generateContent = async (prompt, label = 'request') => {
  const client = getClient();
  log('info', `Sending ${label} to OpenRouter`, { model: MODEL, promptLength: prompt.length });
  const start = Date.now();
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    const text = response.choices?.[0]?.message?.content || '';
    log('info', `OpenRouter ${label} succeeded`, { durationMs: Date.now() - start, responseLength: text.length });
    return text;
  } catch (error) {
    log('error', `OpenRouter ${label} failed`, { durationMs: Date.now() - start, error: error.message });
    throw mapOpenRouterError(error);
  }
};

// ─── Error mapper ─────────────────────────────────────────────────────────────
const mapOpenRouterError = (error) => {
  const msg = error.message || String(error);
  if (msg.includes('401') || msg.includes('invalid_api_key') || msg.includes('Unauthorized')) {
    return new Error('OPENROUTER_API_KEY is invalid or expired. Update server/.env with a valid key from https://openrouter.ai/keys');
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
    return new Error('OpenRouter rate limit reached. Wait a moment and try again, or upgrade your plan at https://openrouter.ai');
  }
  if (msg.includes('404') || msg.includes('not found')) {
    return new Error(`OpenRouter model unavailable: ${msg}`);
  }
  return new Error(`OpenRouter AI error: ${msg}`);
};

// ─── JSON parser helper ───────────────────────────────────────────────────────
const parseJsonFromAI = (raw, fallback = null) => {
  if (!raw) return fallback;
  let clean = raw.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = clean.indexOf('[') >= 0 ? clean.indexOf('[') : clean.indexOf('{');
  const end = Math.max(clean.lastIndexOf(']'), clean.lastIndexOf('}'));
  if (start >= 0 && end > start) {
    clean = clean.slice(start, end + 1);
  }
  try {
    return JSON.parse(clean);
  } catch (parseError) {
    log('error', 'JSON parse failed', { preview: clean.slice(0, 200), error: parseError.message });
    return fallback;
  }
};

// ─── Public exports ───────────────────────────────────────────────────────────

export const checkAIHealth = async () => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return { status: 'error', configured: false, message: 'OPENROUTER_API_KEY is not set in server/.env' };
  }
  try {
    const text = await generateContent('Reply with exactly: OK', 'health-check');
    return { status: 'ok', configured: true, keyValid: true, message: text.trim().slice(0, 50) };
  } catch (error) {
    return { status: 'error', configured: true, keyValid: false, message: error.message };
  }
};

export const generateAIResponse = async (question, context) => {
  log('info', 'Incoming chat question', { topic: context?.topic || 'General', questionLength: question.length });

  const prompt = `You are an expert AI study tutor. The student is studying "${context?.topic || 'general academic material'}".

Student's question: ${question}

Provide a clear, educational, and concise answer. Use bullet points where helpful. Keep it focused and accurate.`;

  return generateContent(prompt, 'chat');
};

export const extractTopicsWithAI = async (text) => {
  log('info', 'Incoming syllabus analysis', { textLength: text.length });
  try {
    const prompt = `Analyze this syllabus text and extract the main study topics.

Syllabus content:
${text.slice(0, 8000)}

Return a JSON array of topics. Each topic must have:
- "name": short topic name (string)
- "description": one sentence description (string)
- "weight": importance score 0.0 to 1.0 (number)

Return ONLY valid JSON, no markdown, no explanation. Example:
[{"name":"Topic Name","description":"What it covers.","weight":0.8}]`;

    const raw = await generateContent(prompt, 'syllabus-extract');
    const topics = parseJsonFromAI(raw, null);
    if (!Array.isArray(topics) || topics.length === 0) {
      log('error', 'Syllabus extract returned empty or invalid array');
      return null;
    }
    return topics;
  } catch (error) {
    log('error', 'extractTopicsWithAI failed', { error: error.message });
    return null;
  }
};

export const generateQuiz = async (topic, syllabusContext = '', options = {}) => {
  const difficulty = options.difficulty || 'Medium';
  const numQuestions = parseInt(options.numQuestions, 10) || 5;
  const context = syllabusContext ? `\nSyllabus context: ${syllabusContext.slice(0, 3000)}` : '';

  const numMcq = Math.max(1, Math.floor(numQuestions * 0.4));
  const numTf = Math.max(1, Math.floor(numQuestions * 0.4));
  const numShort = Math.max(1, numQuestions - numMcq - numTf);

  const prompt = `Generate a quiz about "${topic}" for a student at ${difficulty} difficulty.${context}

Create exactly ${numQuestions} questions: ${numMcq} multiple choice, ${numTf} true/false, and ${numShort} short answer.

Return ONLY a valid JSON array. Each question object must have:
- "type": "mcq" | "tf" | "short"
- "question": the question text
- "options": array of strings (4 options for mcq, ["True","False"] for tf, [] for short)
- "correctAnswer": the correct answer string
- "explanation": a clear explanation of why that answer is correct

No markdown fences, no extra text, just raw JSON.`;

  const raw = await generateContent(prompt, 'quiz');
  const questions = parseJsonFromAI(raw);
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('AI returned invalid quiz format. Please try again.');
  }
  return questions;
};

export const generateNotes = async (topic, type, syllabusContext = '') => {
  const context = syllabusContext ? `\nSyllabus context: ${syllabusContext.slice(0, 3000)}` : '';
  const typeInstructions = {
    short: 'Create concise bullet-point notes covering the key concepts. Keep it brief and scannable.',
    detailed: 'Create comprehensive study notes with headings, subheadings, detailed explanations, examples, and formulas where applicable.',
    revision: 'Create a quick revision guide with the most important points to remember, key definitions, and common exam pitfalls.',
  };

  const prompt = `You are an expert academic tutor. Generate study notes about "${topic}".${context}

Instructions: ${typeInstructions[type] || typeInstructions.short}

You MUST structure the notes with the following sections:
1. **Key Concepts**
2. **Important Definitions**
3. **Core Material** (The main notes based on the requested type)
4. **Exam Tips**

Format using strictly standard Markdown. Use ##, ###, bullet points, and **bold** for emphasis. Do not wrap the whole response in a markdown code block.`;

  const content = await generateContent(prompt, 'notes');

  const qPrompt = `Based on the topic "${topic}", generate 4 important exam-style questions a student should be able to answer. Return ONLY a raw JSON array of strings, no markdown formatting.`;
  const qRaw = await generateContent(qPrompt, 'notes-questions');
  let importantQuestions = parseJsonFromAI(qRaw, null);
  if (!Array.isArray(importantQuestions)) {
    importantQuestions = [
      `What are the key principles of ${topic}?`,
      `How does ${topic} apply in practice?`,
      `What are common misconceptions about ${topic}?`,
      `Explain the relationship between ${topic} and related concepts.`,
    ];
  }
  return { content, importantQuestions };
};

export const generateRevisionCards = async (topic, syllabusContext = '') => {
  const context = syllabusContext ? `\nSyllabus context: ${syllabusContext.slice(0, 3000)}` : '';
  const prompt = `Create 6 spaced-repetition flashcards for the topic "${topic}".${context}

Focus on:
- Core definitions
- Important concepts students frequently get wrong
- Key relationships and applications
- Exam-relevant facts

Return ONLY a valid JSON array. Each card must have:
- "question": the question on the front of the card
- "answer": the detailed answer on the back
- "difficulty": "easy" | "medium" | "hard"

No markdown, no extra text, just raw JSON.`;

  const raw = await generateContent(prompt, 'revision-cards');
  const cards = parseJsonFromAI(raw);
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error('AI returned invalid flashcard format. Please try again.');
  }
  return cards;
};

export const generateStudyPlanSessions = async (topics, dailyHours, totalDays, learningStyle) => {
  log('info', 'Generating AI study plan sessions', { topicCount: topics.length, dailyHours, totalDays, learningStyle });
  const prompt = `Create a ${totalDays}-day study plan for these topics: ${topics.join(', ')}.
Daily study time: ${dailyHours} hours. Learning style: ${learningStyle}.

Return ONLY a JSON array with exactly ${totalDays} day objects. Each object:
- "day": number (1 to ${totalDays})
- "topics": array of topic names to cover that day
- "focus": one sentence study focus for the day
- "activities": array of 2-3 specific study activities (strings)
- "durationMinutes": total minutes (based on ${dailyHours} hours)

No markdown, raw JSON only.`;

  const raw = await generateContent(prompt, 'study-plan');
  const plan = parseJsonFromAI(raw);
  if (!Array.isArray(plan) || plan.length === 0) {
    throw new Error('AI returned invalid study plan format. Please try again.');
  }
  return plan;
};

export const generateAIRecommendations = async (courses) => {
  const summary = (courses || [])
    .map((c) => `${c.name}: ${(c.topics || []).map((t) => t.name).join(', ')}`)
    .join('\n');

  const prompt = `A student has studied these courses:
${summary || 'No courses yet — they are a beginner.'}

Suggest 4 personalized next courses to study. Return ONLY a JSON array. Each item:
- "name": course name
- "reason": why this fits the student (1 sentence)
- "difficulty": "Beginner" | "Intermediate" | "Advanced"
- "duration": estimated weeks as string e.g. "4 weeks"
- "careerBenefits": one sentence

No markdown, raw JSON only.`;

  const raw = await generateContent(prompt, 'recommendations');
  const recs = parseJsonFromAI(raw);
  if (!Array.isArray(recs) || recs.length === 0) {
    return null;
  }
  return recs.slice(0, 4).map((r, i) => ({
    id: `ai-rec-${i}-${Date.now()}`,
    name: r.name,
    reason: r.reason,
    difficulty: r.difficulty || 'Intermediate',
    duration: r.duration || '4 weeks',
    careerBenefits: r.careerBenefits || 'Expand your skillset',
    domain: 'ai-generated',
  }));
};

// ─── Utility exports (no AI calls needed) ────────────────────────────────────
export const extractTopicMentions = (text) => {
  const commonTopics = ['photosynthesis', 'mitochondria', 'calculus', 'algebra', 'chemistry', 'physics', 'biology', 'history', 'literature'];
  return commonTopics.filter((topic) => text.toLowerCase().includes(topic));
};

export const generateStudyTip = (topic, difficulty) => {
  const tips = {
    easy: `Great job with ${topic}! Try to teach this concept to someone else to deepen your understanding.`,
    medium: `Keep working on ${topic}. Break it down into smaller parts and practice regularly.`,
    hard: `${topic} can be challenging! Try different learning resources and discuss with peers.`,
  };
  return tips[difficulty] || tips.medium;
};
