import mongoose from 'mongoose';
import { ENV } from './env';

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  // Reuse existing database connection if already connected (Serverless optimization)
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (!cachedPromise) {
    mongoose.set('strictQuery', true);
    cachedPromise = mongoose
      .connect(ENV.MONGODB_URI, {
        dbName: 'parkhere',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log(`[Database] Connected to MongoDB: ${m.connection.host}`);
        return m;
      })
      .catch(async (err) => {
        console.warn(`[Database] Could not connect to primary MONGODB_URI: ${err.message}`);
        cachedPromise = null;

        // In production/serverless, rethrow error rather than trying embedded binary
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
          throw err;
        }

        console.log('[Database] Initializing embedded MongoDB engine for development/testing...');
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create({
            instance: { dbName: 'parkhere' },
          });
          const uri = mongod.getUri();
          return await mongoose.connect(uri);
        } catch (memoryErr: any) {
          console.error('[Database] Failed to initialize embedded MongoDB engine:', memoryErr);
          throw memoryErr;
        }
      });
  }

  return cachedPromise;
};

