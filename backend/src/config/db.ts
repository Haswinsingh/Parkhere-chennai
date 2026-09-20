import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    // Attempt connecting to the configured MONGODB_URI
    mongoose.set('strictQuery', true);
    
    // Set connection timeout to 15000ms for cloud Atlas replica sets
    await mongoose.connect(ENV.MONGODB_URI, {
      dbName: 'parkhere',
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[Database] Connected to MongoDB: ${mongoose.connection.host}`);
  } catch (err: any) {
    console.warn(`[Database] Could not connect to MONGODB_URI (${ENV.MONGODB_URI}): ${err.message}`);
    console.log('[Database] Initializing embedded MongoDB engine for development/testing...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'parkhere',
        }
      });
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[Database] Connected to Embedded MongoDB Instance at: ${uri}`);
    } catch (memoryErr: any) {
      console.error('[Database] Failed to initialize embedded MongoDB engine:', memoryErr);
      throw memoryErr;
    }
  }
};
