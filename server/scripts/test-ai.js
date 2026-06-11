/**
 * AI diagnostic test script — run: node server/scripts/test-ai.js
 * Requires: server running on PORT, valid GEMINI_API_KEY in server/.env
 */
import '../config/env.js';

const BASE = `http://localhost:${process.env.PORT || 5000}`;

const results = [];

async function test(name, fn) {
  try {
    const output = await fn();
    results.push({ name, status: 'PASS', output });
    console.log(`✅ ${name}`);
    if (output) console.log('   ', typeof output === 'string' ? output.slice(0, 120) : JSON.stringify(output).slice(0, 200));
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function main() {
  console.log('\n=== AI Diagnostic Tests ===\n');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'MISSING');

  await test('Health endpoint', async () => {
    const res = await fetch(`${BASE}/api/ai/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || JSON.stringify(data));
    return data;
  });

  await test('Chat AI (generateAIResponse)', async () => {
    const { generateAIResponse } = await import('../services/aiService.js');
    const reply = await generateAIResponse('What is photosynthesis in one sentence?', { topic: 'Biology' });
    if (!reply || reply.length < 10) throw new Error('Empty or too short response');
    return reply;
  });

  await test('Syllabus topic extraction', async () => {
    const { extractTopicsWithAI } = await import('../services/aiService.js');
    const topics = await extractTopicsWithAI('Unit 1: Introduction to Algorithms. Unit 2: Sorting and Searching. Unit 3: Graph Theory.');
    if (!topics?.length) throw new Error('No topics extracted');
    return topics;
  });

  await test('Quiz generation', async () => {
    const { generateQuiz } = await import('../services/aiService.js');
    const questions = await generateQuiz('Photosynthesis', '', { difficulty: 'Easy', numQuestions: 3 });
    if (!questions?.length) throw new Error('No questions generated');
    return { count: questions.length, first: questions[0]?.question };
  });

  await test('Notes generation', async () => {
    const { generateNotes } = await import('../services/aiService.js');
    const notes = await generateNotes('Newton Laws', 'short', '');
    if (!notes?.content) throw new Error('No notes content');
    return { contentLength: notes.content.length, questions: notes.importantQuestions?.length };
  });

  await test('Revision cards generation', async () => {
    const { generateRevisionCards } = await import('../services/aiService.js');
    const cards = await generateRevisionCards('Cell Biology', '');
    if (!cards?.length) throw new Error('No cards generated');
    return { count: cards.length, first: cards[0]?.question };
  });

  await test('Study plan AI sessions', async () => {
    const { generateStudyPlanSessions } = await import('../services/aiService.js');
    const plan = await generateStudyPlanSessions(['Algebra', 'Calculus'], 2, 3, 'mixed');
    if (!plan?.length) throw new Error('No plan days generated');
    return { days: plan.length, day1: plan[0]?.focus };
  });

  await test('AI recommendations', async () => {
    const { generateAIRecommendations } = await import('../services/aiService.js');
    const recs = await generateAIRecommendations([{ name: 'Data Structures', topics: [{ name: 'Trees' }, { name: 'Graphs' }] }]);
    if (!recs?.length) throw new Error('No recommendations');
    return recs.map((r) => r.name);
  });

  console.log('\n=== Summary ===');
  const passed = results.filter((r) => r.status === 'PASS').length;
  console.log(`${passed}/${results.length} tests passed\n`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
