import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    conversationId: {
      type: String,
      required: true,
    },
    messages: [
      {
        id: String,
        sender: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        relatedTopics: [String],
      },
    ],
    title: {
      type: String,
      default: 'New Conversation',
    },
    context: {
      topic: String,
      subtopics: [String],
      difficulty: String,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    helpfulRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
