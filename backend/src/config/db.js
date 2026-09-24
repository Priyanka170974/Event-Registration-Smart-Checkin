import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

export async function connectDB(uri = process.env.MONGO_URI) {
  if (!uri) {
    throw new Error('MONGO_URI is required to connect to MongoDB Atlas.');
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 20,
    minPoolSize: 2,
    autoIndex: false,
  });

  console.log('MongoDB connection established.');

  // Explicit index creation also runs in production, so database-level
  // uniqueness is guaranteed before the API begins accepting traffic.
  await Promise.all([
    User.createIndexes(),
    Event.createIndexes(),
    Registration.createIndexes(),
  ]);

  return connection;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
