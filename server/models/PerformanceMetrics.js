import mongoose from 'mongoose';

const performanceMetricsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    dailyStats: [
      {
        date: Date,
        studyHours: Number,
        topicsReviewed: Number,
        cardsReviewed: Number,
        cardsCorrect: Number,
        accuracy: Number, // percentage
      },
    ],
    weeklyStats: [
      {
        week: String, // YYYY-WW format
        totalStudyHours: Number,
        topicsCompleted: Number,
        averageAccuracy: Number,
        streak: Number, // consecutive days
      },
    ],
    monthlyStats: [
      {
        month: String, // YYYY-MM format
        totalStudyHours: Number,
        topicsCompleted: Number,
        averageAccuracy: Number,
        improvementRate: Number, // percentage
      },
    ],
    overallStats: {
      totalStudyHours: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      averageAccuracy: {
        type: Number,
        default: 0,
      },
      topicsCompleted: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PerformanceMetrics = mongoose.model('PerformanceMetrics', performanceMetricsSchema);
export default PerformanceMetrics;
