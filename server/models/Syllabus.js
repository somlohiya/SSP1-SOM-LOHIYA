import mongoose from 'mongoose';

const syllabusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      default: '',
    },
    uploadedFile: {
      filename: String,
      size: Number,
      uploadedAt: Date,
    },
    extractedContent: {
      rawText: String,
      topics: [
        {
          name: String,
          description: String,
          weight: Number, // 0-1 importance
        },
      ],
      estimatedStudyHours: Number,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'error'],
      default: 'uploaded',
    },
    processingError: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Syllabus = mongoose.model('Syllabus', syllabusSchema);
export default Syllabus;
