import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parkhere',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_parkhere_production_2026_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  STORAGE_PATH: process.env.STORAGE_PATH || './uploads',
  ARRIVAL_RADIUS_METERS: process.env.ARRIVAL_RADIUS_METERS ? parseInt(process.env.ARRIVAL_RADIUS_METERS, 10) : 100,
  UPI_PROVIDER_CONFIG: process.env.UPI_PROVIDER_CONFIG || '',
};
