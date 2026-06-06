import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  topic: { type: String, required: true },
  type: { type: String, enum: ['short', 'detailed', 'revision'], required: true },
  content: { type: String, required: true },
  importantQuestions: [String],
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
