import app from '../server/server.js';
import mongoose from 'mongoose';

// Disable Vercel's automatic body parsing — multer needs the raw stream
// to parse multipart/form-data (file uploads). Without this, req.file is
// always undefined and Cloudinary upload silently fails.
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('Missing MONGO_URI environment variable');
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    return res.status(500).json({ message: 'Database connection failed: ' + err.message });
  }
  return app(req, res);
}
