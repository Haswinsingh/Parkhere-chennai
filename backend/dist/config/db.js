"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        // Attempt connecting to the configured MONGODB_URI
        mongoose_1.default.set('strictQuery', true);
        // Set connection timeout to 15000ms for cloud Atlas replica sets
        await mongoose_1.default.connect(env_1.ENV.MONGODB_URI, {
            dbName: 'parkhere',
            serverSelectionTimeoutMS: 15000,
        });
        console.log(`[Database] Connected to MongoDB: ${mongoose_1.default.connection.host}`);
    }
    catch (err) {
        console.warn(`[Database] Could not connect to MONGODB_URI (${env_1.ENV.MONGODB_URI}): ${err.message}`);
        console.log('[Database] Initializing embedded MongoDB engine for development/testing...');
        try {
            const { MongoMemoryServer } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
            const mongod = await MongoMemoryServer.create({
                instance: {
                    dbName: 'parkhere',
                }
            });
            const uri = mongod.getUri();
            await mongoose_1.default.connect(uri);
            console.log(`[Database] Connected to Embedded MongoDB Instance at: ${uri}`);
        }
        catch (memoryErr) {
            console.error('[Database] Failed to initialize embedded MongoDB engine:', memoryErr);
            throw memoryErr;
        }
    }
};
exports.connectDB = connectDB;
