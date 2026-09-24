import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

let transactionSupport = true;

export function databaseSupportsTransactions() {
  return transactionSupport;
}

export async function connectDB(uri = process.env.MONGO_URI) {
  if (!uri) {
    throw new Error('MONGO_URI is required to connect to MongoDB Atlas.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: 20,
    minPoolSize: 2,
    autoIndex: false,
  });

  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    transactionSupport = Boolean(hello.setName || hello.msg === 'isdbgrid');
  } catch {
    // If the capability probe is unavailable, keep the production-safe path.
    transactionSupport = true;
    console.warn('MongoDB transaction capability could not be verified; assuming transactions are available.');
  }

  if (!transactionSupport && process.env.NODE_ENV === 'production') {
    throw new Error('The configured MongoDB deployment does not support transactions. Use MongoDB Atlas or a replica set in production.');
  }

  console.log('MongoDB connection established.');
  if (!transactionSupport) {
    console.warn('Development standalone mode: transaction fallback enabled. Use a replica set in production.');
  }

  // Explicit index creation also runs in production, so database-level
  // uniqueness is guaranteed before the API begins accepting traffic.
  await Promise.all([
    User.createIndexes(),
    Event.createIndexes(),
    Registration.createIndexes(),
  ]);

  return mongoose.connection;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  transactionSupport = true;
}
