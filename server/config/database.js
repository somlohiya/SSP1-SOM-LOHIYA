import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    
    const mongoUrl =
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/sleek-syllabus';

    await mongoose.connect(mongoUrl);

    console.log('[v0] MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('[v0] MongoDB connection failed:', error.message);
    return false;
  }
};

export default connectDB;