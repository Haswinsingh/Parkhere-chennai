"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.ENV = {
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
