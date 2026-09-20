import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_MONGODB_URI =
  'mongodb://haswinsinghak_db_user:WSp8ykOFZMiE2HEs@ac-1etuyhd-shard-00-00.lbvdrxv.mongodb.net:27017,ac-1etuyhd-shard-00-01.lbvdrxv.mongodb.net:27017,ac-1etuyhd-shard-00-02.lbvdrxv.mongodb.net:27017/parkhere?ssl=true&replicaSet=atlas-6nlcw3-shard-0&authSource=admin&appName=Cluster0';

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || DEFAULT_MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_parkhere_production_2026_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  STORAGE_PATH: process.env.STORAGE_PATH || './uploads',
  ARRIVAL_RADIUS_METERS: process.env.ARRIVAL_RADIUS_METERS ? parseInt(process.env.ARRIVAL_RADIUS_METERS, 10) : 100,
  UPI_PROVIDER_CONFIG: process.env.UPI_PROVIDER_CONFIG || '',
};
