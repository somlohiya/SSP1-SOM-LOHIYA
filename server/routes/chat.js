import express from 'express';
import ChatHistory from '../models/ChatHistory.js';
import { authMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { generateAIResponse, extractTopicMentions, generateStudyTip } from '../services/aiService.js';

const router = express.Router();

// Create conversation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseId, topic } = req.body;

    const conversationId = uuidv4();

    const chatHistory = new ChatHistory({
      userId: req.userId,
      courseId,
      conversationId,
      messages: [],
      context: {
        topic: topic || 'General',
        subtopics: [],
      },
      title: `Chat about ${topic || 'Study Material'}`,
    });

    await chatHistory.save();

    // Return the document directly so the frontend can use it as a Conversation object
    res.status(201).json(chatHistory);
  } catch (error) {
    console.error('[v0] Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get conversations for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const conversations = await ChatHistory.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('[v0] Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get conversation details
router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const conversation = await ChatHistory.findOne({
      conversationId: req.params.conversationId,
      userId: req.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('[v0] Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Add message to conversation
router.post('/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { sender, content, relatedTopics } = req.body;

    if (!sender || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conversation = await ChatHistory.findOne({
      conversationId: req.params.conversationId,
      userId: req.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const message = {
      id: uuidv4(),
      sender,
      content,
      timestamp: new Date(),
      relatedTopics: relatedTopics || [],
    };

    conversation.messages.push(message);

    // Generate AI response if user message
    if (sender === 'user') {
      console.log('[chat] Incoming user message', {
        conversationId: req.params.conversationId,
        contentLength: content.length,
        topic: conversation.context?.topic,
      });
      try {
        const aiContent = await generateAIResponse(content, conversation.context);
        const mentionedTopics = extractTopicMentions(content);

        const aiResponse = {
          id: uuidv4(),
          sender: 'assistant',
          content: aiContent,
          timestamp: new Date(),
          relatedTopics: mentionedTopics,
        };

        conversation.messages.push(aiResponse);
      } catch (aiError) {
        console.error('[chat] Gemini AI error:', aiError.message, aiError.stack);
        conversation.messages.push({
          id: uuidv4(),
          sender: 'assistant',
          content: `⚠️ AI tutor is temporarily unavailable: ${aiError.message}`,
          timestamp: new Date(),
          relatedTopics: [],
        });
      }
    }

    await conversation.save();

    // Return the conversation document directly so the frontend can use it as a Conversation object
    res.json(conversation);
  } catch (error) {
    console.error('[v0] Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Rate conversation
router.patch('/:conversationId/rate', authMiddleware, async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const conversation = await ChatHistory.findOneAndUpdate(
      { conversationId: req.params.conversationId, userId: req.userId },
      { helpfulRating: rating, resolved: true },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('[v0] Rate conversation error:', error);
    res.status(500).json({ error: 'Failed to rate conversation' });
  }
});

// Delete conversation
router.delete('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const conversation = await ChatHistory.findOneAndDelete({
      conversationId: req.params.conversationId,
      userId: req.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('[v0] Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
