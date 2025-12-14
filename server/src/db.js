import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || undefined;

  if (!uri) {
    console.warn('MONGODB_URI not set; skipping Mongo connection');
    return;
  }

  try {
    await mongoose.connect(uri, dbName ? { dbName } : {});
    console.log(`MongoDB connected${dbName ? ` (${dbName})` : ''}`);
  } catch (err) {
    console.error('MongoDB connection failed', err);
    throw err;
  }
}
