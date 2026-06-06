import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let cachedApiKey = null;

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[AI] ❌ GEMINI_API_KEY is not set in server/.env');
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in server/.env');
  }

  if (!apiKey.startsWith('AIza')) {
    console.error('[AI] ❌ GEMINI_API_KEY appears invalid. It must start with "AIza". Current value starts with:', apiKey.substring(0, 10));
    throw new Error('GEMINI_API_KEY is invalid. Gemini keys must start with "AIza". Please get a valid key from https://aistudio.google.com/app/apikey');
  }

  // Reinitialize if key changed (e.g., after .env update)
  if (!genAI || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[AI] ✅ Gemini client initialized. Key prefix:', apiKey.substring(0, 10));
  }

  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

/**
 * AI Tutor - generate a contextual response to a student question
 */
export const generateAIResponse = async (question, context) => {
  console.log('[AI] 📨 Incoming question:', question);
  console.log('[AI] 📚 Context topic:', context?.topic || 'General');

  try {
    const model = getModel();

    const prompt = `You are an expert AI study tutor. The student is studying "${context?.topic || 'general academic material'}".

Student's question: ${question}

Provide a clear, educational, and concise answer. Use bullet points where helpful. Keep it focused and accurate.`;

    console.log('[AI] 🚀 Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('[AI] ✅ Gemini response received. Length:', text.length, 'chars');
    return text;
  } catch (error) {
    console.error('[AI] ❌ generateAIResponse failed:', error.message);
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
      throw new Error('Your GEMINI_API_KEY is invalid or expired. Please update it in server/.env with a valid key from https://aistudio.google.com/app/apikey');
    }
    if (error.message.includes('quota') || error.message.includes('429')) {
      throw new Error('Gemini API quota exceeded. Please wait or upgrade your plan at https://aistudio.google.com');
    }
    throw new Error(`Gemini AI error: ${error.message}`);
  }
};

/**
 * Extract topics from syllabus text using Gemini
 */
export const extractTopicsWithAI = async (text) => {
  try {
    const model = getModel();
    const prompt = `Analyze this syllabus text and extract the main study topics.

Syllabus content:
${text.slice(0, 8000)}

Return a JSON array of topics. Each topic must have:
- "name": short topic name (string)
- "description": one sentence description (string)
- "weight": importance score 0.0 to 1.0 (number)

Return ONLY valid JSON, no markdown, no explanation. Example:
[{"name":"Topic Name","description":"What it covers.","weight":0.8}]`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('[AI] extractTopicsWithAI error:', error.message);
    return null; // caller falls back to regex extraction
  }
};

/**
 * Generate quiz questions using Gemini
 */
export const generateQuiz = async (topic, syllabusContext = '', options = {}) => {
  try {
    const model = getModel();
    const context = syllabusContext ? `\nSyllabus context: ${syllabusContext.slice(0, 3000)}` : '';

    const difficulty = options.difficulty || 'Medium';
    const numQuestions = parseInt(options.numQuestions, 10) || 5;

    // Calculate distribution (roughly 40% MCQ, 40% T/F, 20% Short)
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

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('[AI] generateQuiz error:', error.message);
    throw new Error('Failed to generate quiz. Check your GEMINI_API_KEY.');
  }
};

/**
 * Generate study notes using Gemini
 */
export const generateNotes = async (topic, type, syllabusContext = '') => {
  try {
    const model = getModel();
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

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Generate important questions
    const qPrompt = `Based on the topic "${topic}", generate 4 important exam-style questions a student should be able to answer. Return ONLY a raw JSON array of strings, no markdown formatting.`;
    const qResult = await model.generateContent(qPrompt);
    const qRaw = qResult.response.text().trim().replace(/```json|```/g, '').trim();

    let importantQuestions = [];
    try {
      importantQuestions = JSON.parse(qRaw);
    } catch {
      importantQuestions = [`What are the key principles of ${topic}?`, `How does ${topic} apply in practice?`, `What are common misconceptions about ${topic}?`, `Explain the relationship between ${topic} and related concepts.`];
    }

    return { content, importantQuestions };
  } catch (error) {
    console.error('[AI] generateNotes error:', error.message);
    throw new Error('Failed to generate notes. Check your GEMINI_API_KEY.');
  }
};

/**
 * Generate smart revision flashcards using Gemini
 */
export const generateRevisionCards = async (topic, syllabusContext = '') => {
  try {
    const model = getModel();
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

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('[AI] generateRevisionCards error:', error.message);
    throw new Error('Failed to generate revision cards. Check your GEMINI_API_KEY.');
  }
};

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
