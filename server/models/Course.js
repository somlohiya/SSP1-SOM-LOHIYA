import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    syllabusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Syllabus',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    topics: [
      {
        id: String,
        name: String,
        description: String,
        subtopics: [String],
        estimatedHours: Number,
        completed: {
          type: Boolean,
          default: false,
        },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
      },
    ],
    totalEstimatedHours: {
      type: Number,
      default: 0,
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
