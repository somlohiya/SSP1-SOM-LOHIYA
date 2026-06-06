import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    sessions: [
      {
        id: String,
        date: Date,
        dayOfWeek: String,
        startTime: String,
        endTime: String,
        duration: Number, // in minutes
        topics: [String],
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
        notes: String,
      },
    ],
    totalSessions: {
      type: Number,
      default: 0,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },
    totalDays: {
      type: Number,
      default: 4,
    },
    startDate: Date,
    endDate: Date,
    examDate: Date,
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'mixed'],
      default: 'mixed',
    },
    dailyHours: {
      type: Number,
      default: 2,
    },
    weeklyPattern: {
      monday: Boolean,
      tuesday: Boolean,
      wednesday: Boolean,
      thursday: Boolean,
      friday: Boolean,
      saturday: Boolean,
      sunday: Boolean,
    },
    status: {
      type: String,
      enum: ['created', 'active', 'paused', 'completed'],
      default: 'created',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
export default StudyPlan;
