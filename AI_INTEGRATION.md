# AI Integration Guide

This document explains how to integrate real AI services (Claude, GPT, etc.) into Sleek Syllabus Planner.

## Current State

The application includes placeholder AI implementations that provide realistic responses based on simple pattern matching. These are ready to be replaced with actual AI APIs.

## Claude AI Integration (Recommended)

Claude is the recommended AI provider due to its strong performance on educational content.

### Setup

1. **Get API Key**
   - Sign up at [anthropic.com](https://anthropic.com)
   - Create API key from dashboard
   - Add to `.env.local`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   ```

2. **Install Package**
   ```bash
   pnpm add @anthropic-ai/sdk
   ```

3. **Update AI Service**

Replace `server/services/aiService.js`:

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateAIResponse = async (question, context) => {
  const systemPrompt = `You are an expert educational tutor helping students master their coursework. 
You provide clear, concise explanations using examples when helpful. 
Current topic: ${context?.topic || 'General'}
Keep responses focused and educational.`;

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: question,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate response';
};

export const extractTopicMentions = (text) => {
  // This can be enhanced with Claude's understanding
  return [];
};

export const generateStudyTip = async (topic, difficulty) => {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Give a brief study tip for learning "${topic}" at ${difficulty} difficulty level.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
};
```

## OpenAI GPT Integration

Alternative integration using OpenAI's API.

### Setup

1. **Get API Key**
   - Sign up at [openai.com](https://openai.com)
   - Create API key
   - Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   ```

2. **Install Package**
   ```bash
   pnpm add openai
   ```

3. **Update AI Service**

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAIResponse = async (question, context) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `You are an expert educational tutor helping students master their coursework. 
Topic: ${context?.topic || 'General'}`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
};
```

## Streaming Responses

For better UX, implement streaming responses using Server-Sent Events (SSE).

### Backend Endpoint

```javascript
router.post('/:conversationId/messages-stream', authMiddleware, async (req, res) => {
  const { sender, content } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        res.write(`data: ${JSON.stringify({ delta: event.delta })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
```

### Frontend Integration

```typescript
const streamResponse = async (conversationId: string, content: string) => {
  const response = await fetch(`/api/chat/${conversationId}/messages-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: 'user', content }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let aiMessage = '';

  while (true) {
    const { done, value } = await reader?.read() || {};
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.delta?.text) {
          aiMessage += data.delta.text;
          // Update UI in real-time
        }
      }
    }
  }

  return aiMessage;
};
```

## Advanced Features

### 1. Syllabus Analysis
Enhance syllabus processing with AI-powered content analysis:

```javascript
export const analyzeSyllabusContent = async (content) => {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Analyze this syllabus and extract:
1. Main topics (list 10-15)
2. Difficulty level (easy/medium/hard)
3. Prerequisites
4. Key concepts

Syllabus: ${content}

Return as JSON.`,
      },
    ],
  });

  return JSON.parse(message.content[0].text);
};
```

### 2. Personalized Study Plans
Generate custom study plans using AI:

```javascript
export const generatePersonalizedPlan = async (
  topics,
  availableHours,
  learningStyle,
  priorKnowledge
) => {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Create a personalized study plan with:
- Topics: ${topics.join(', ')}
- Available hours: ${availableHours}
- Learning style: ${learningStyle}
- Prior knowledge: ${priorKnowledge}

Return as JSON with daily schedule.`,
      },
    ],
  });

  return JSON.parse(message.content[0].text);
};
```

### 3. Smart Flashcard Generation
Auto-generate flashcards from study material:

```javascript
export const generateFlashcards = async (topic, material) => {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: `Generate 10 high-quality flashcards from this material:
Topic: ${topic}
Material: ${material}

Return as JSON array with question/answer pairs.`,
      },
    ],
  });

  return JSON.parse(message.content[0].text);
};
```

### 4. Performance Analysis
Provide AI-powered performance insights:

```javascript
export const analyzePerformance = async (metrics, dailyStats) => {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyze this student's performance and provide personalized advice:
Total study hours: ${metrics.totalStudyHours}
Current streak: ${metrics.currentStreak}
Average accuracy: ${metrics.averageAccuracy}%
Recent trend: ${dailyStats.slice(-7).map((s) => s.accuracy).join(',')}

Provide specific, actionable recommendations.`,
      },
    ],
  });

  return message.content[0].text;
};
```

## Rate Limiting & Caching

Implement caching to reduce API costs:

```javascript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

export const generateAIResponseWithCache = async (question, context) => {
  const cacheKey = `ai_response_${context?.topic}_${question.substring(0, 50)}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await generateAIResponse(question, context);
  cache.set(cacheKey, response);

  return response;
};
```

## Cost Optimization

- **Cache Common Questions**: 80% of questions repeat patterns
- **Batch Processing**: Group flashcard generation requests
- **Cheaper Models**: Use GPT-3.5 for simple tasks, GPT-4 for complex analysis
- **Rate Limiting**: Implement request throttling per user

## Monitoring & Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'ai-usage.log' })],
});

export const logAIUsage = (model, tokens, cost) => {
  logger.info({
    timestamp: new Date(),
    model,
    tokens,
    cost,
  });
};
```

## Testing

Mock AI responses for testing:

```javascript
// jest.mock('../services/aiService.js');

jest.mock('../services/aiService', () => ({
  generateAIResponse: jest.fn(() => Promise.resolve('Mocked response')),
  extractTopicMentions: jest.fn(() => ['topic1', 'topic2']),
}));
```

## Production Checklist

- [ ] API key securely stored in environment variables
- [ ] Rate limiting implemented
- [ ] Caching strategy in place
- [ ] Error handling for API failures
- [ ] Cost monitoring dashboard
- [ ] Fallback responses when API unavailable
- [ ] User feedback mechanism for response quality
- [ ] Regular model updates as new versions release
- [ ] GDPR compliance for data sent to AI API
- [ ] Analytics for AI usage patterns

## Resources

- [Claude API Documentation](https://docs.anthropic.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Cost Calculator](https://calculator.tokens.com/)
- [Best Practices for Education AI](https://www.anthropic.com/educational-ai)

---

**Next Steps**: Choose your AI provider, follow the setup guide, and test thoroughly before production deployment.
