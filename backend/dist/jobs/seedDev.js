"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * EXPLICIT DEVELOPMENT-ONLY SEED SCRIPT
 * Run manually via: npm run seed
 * NOT invoked automatically in production.
 */
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
async function seed() {
    await (0, db_1.connectDB)();
    console.log('[Seed] Connected to database for explicit dev seeding...');
    // Create an initial platform administrator if none exists
    const existingAdmin = await User_1.User.findOne({ role: 'admin' });
    if (!existingAdmin) {
        const salt = await bcryptjs_1.default.genSalt(12);
        const passwordHash = await bcryptjs_1.default.hash('Admin@123456', salt);
        await User_1.User.create({
            name: 'ParkHere Platform Admin',
            email: 'admin@parkhere.io',
            phone: '+919876543210',
            passwordHash,
            role: 'admin',
            isActive: true,
            verificationStatus: 'approved',
        });
        console.log('[Seed] Created default platform administrator: admin@parkhere.io / Admin@123456');
    }
    else {
        console.log('[Seed] Admin account already exists.');
    }
    console.log('[Seed] Explicit seed finished.');
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed().catch((err) => {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
});
