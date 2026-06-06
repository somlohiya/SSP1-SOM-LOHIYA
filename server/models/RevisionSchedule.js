import mongoose from 'mongoose';

const revisionScheduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    revisionCards: [
      {
        id: String,
        question: String,
        answer: String,
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
        repetitions: {
          type: Number,
          default: 0,
        },
        interval: {
          type: Number,
          default: 1, // days
        },
        nextReviewDate: Date,
        easinessFactor: {
          type: Number,
          default: 2.5,
        },
        lastReviewDate: Date,
        quality: {
          type: Number,
          min: 0,
          max: 5,
          default: 3,
        },
      },
    ],
    totalCards: {
      type: Number,
      default: 0,
    },
    masteredCards: {
      type: Number,
      default: 0,
    },
    studyStreak: {
      type: Number,
      default: 0,
    },
    lastStudyDate: Date,
    algorithm: {
      type: String,
      enum: ['leitner', 'spaced_repetition', 'interval'],
      default: 'spaced_repetition',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const RevisionSchedule = mongoose.model('RevisionSchedule', revisionScheduleSchema);
export default RevisionSchedule;
