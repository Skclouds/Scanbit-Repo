/**
 * Seed Admin Users
 *
 * Creates or updates admin users (including master admin). Idempotent: re-run
 * to sync with config; existing users are updated by email.
 *
 * Sources (first wins):
 * 1. SEED_ADMINS env – JSON array: [{"email","name","password","master?"}, ...]
 * 2. scripts/seed-admins.json – same format (copy from seed-admins.example.json)
 * 3. MASTER_ADMIN_EMAIL + MASTER_ADMIN_PASSWORD (optional) – single master admin
 *
 * Password rules (User model): min 8 chars, one upper, one lower, one number,
 * one special from @$!%*?&
 *
 * Usage:
 *   cd ScanBit-Backend && node scripts/seedAdmins.js
 *   SEED_ADMINS='[{"email":"a@b.com","name":"Admin","password":"Abc@1234","master":true}]' node scripts/seedAdmins.js
 */

import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character (@$!%*?&).';
  }
  return null;
}

function loadAdmins() {
  // 1. Env SEED_ADMINS (JSON string)
  const envJson = process.env.SEED_ADMINS;
  if (envJson) {
    try {
      const parsed = JSON.parse(envJson);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (_e) {
      process.exit(1);
    }
  }

  // 2. seed-admins.json next to this script
  const jsonPath = join(__dirname, 'seed-admins.json');
  if (existsSync(jsonPath)) {
    try {
      const raw = readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (_e) {
      process.exit(1);
    }
  }

  // 3. Single master from env
  const email = process.env.MASTER_ADMIN_EMAIL;
  const password = process.env.MASTER_ADMIN_PASSWORD;
  if (email) {
    const name = process.env.MASTER_ADMIN_NAME || 'Master Admin';
    return [{ email, name, password: password || 'ChangeMe@123', master: true }];
  }

  process.exit(1);
}

function normalizeAdmin(entry, index) {
  const email = (entry.email || '').trim().toLowerCase();
  const name = (entry.name || '').trim() || `Admin ${index + 1}`;
  const password = entry.password;
  const master = Boolean(entry.master);

  if (!email) process.exit(1);
  const err = validatePassword(password);
  if (err) process.exit(1);
  return { email, name, password, master };
}

async function seedAdmins() {
  const uri = process.env.MONGODB_URI;
  if (!uri) process.exit(1);

  const raw = loadAdmins();
  const admins = raw.map((entry, i) => normalizeAdmin(entry, i));

  try {
    await mongoose.connect(uri);
  } catch (_e) {
    process.exit(1);
  }

  try {
    for (const { email, name, password, master } of admins) {
      let user = await User.findOne({ email }).select('+password');
      if (user) {
        user.name = name;
        user.password = password;
        user.role = 'admin';
        user.hasAdminAccess = true;
        user.isMasterAdmin = master;
        user.isActive = true;
        user.registration_through = 'By admin';
        await user.save();
      } else {
        await User.create({
          name,
          email,
          password,
          role: 'admin',
          hasAdminAccess: true,
          isMasterAdmin: master,
          isActive: true,
          registration_through: 'By admin',
        });
      }
    }
  } catch (_e) {
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }

  process.exit(0);
}

seedAdmins();
