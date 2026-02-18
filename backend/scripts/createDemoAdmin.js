import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const DEMO_ADMIN_EMAIL = 'admin@scanbit.com';
const DEMO_ADMIN_PASSWORD = 'admin123';

const createDemoAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if demo admin already exists
    let user = await User.findOne({ email: DEMO_ADMIN_EMAIL });

    if (!user) {

      // Create the demo admin user
      user = await User.create({
        name: 'Demo Admin',
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
        role: 'admin',
        hasAdminAccess: true,
        isActive: true,
        registration_through: 'By admin'
      });
      

    } else {
      // Update existing user to admin
      user.role = 'admin';
      user.hasAdminAccess = true;
      user.isActive = true;
      await user.save();
      

    }







    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {

    await mongoose.connection.close();
    process.exit(1);
  }
};

createDemoAdmin();