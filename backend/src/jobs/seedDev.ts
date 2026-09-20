/**
 * EXPLICIT DEVELOPMENT-ONLY SEED SCRIPT
 * Run manually via: npm run seed
 * NOT invoked automatically in production.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';

async function seed() {
  await connectDB();
  console.log('[Seed] Connected to database for explicit dev seeding...');

  // Create an initial platform administrator if none exists
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Admin@123456', salt);
    await User.create({
      name: 'ParkHere Platform Admin',
      email: 'admin@parkhere.io',
      phone: '+919876543210',
      passwordHash,
      role: 'admin',
      isActive: true,
      verificationStatus: 'approved',
    });
    console.log('[Seed] Created default platform administrator: admin@parkhere.io / Admin@123456');
  } else {
    console.log('[Seed] Admin account already exists.');
  }

  console.log('[Seed] Explicit seed finished.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
