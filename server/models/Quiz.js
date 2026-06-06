import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  topic: { type: String, required: true },
  questions: [{
    type: { type: String, enum: ['mcq', 'tf', 'short'], required: true },
    question: { type: String, required: true },
    options: [String], // For MCQ
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true }
  }],
  score: { type: Number, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
