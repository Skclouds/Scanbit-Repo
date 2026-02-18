import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../models/User.js';


dotenv.config();

const MASTER_ADMIN_EMAIL = 'rudranshdevelopment@gmail.com';

const setMasterAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Find the user by email
    let user = await User.findOne({ email: MASTER_ADMIN_EMAIL });

    if (!user) {


      // Create the master admin user
      user = await User.create({
        name: 'Rudransh Infotech Private Limited',
        email: MASTER_ADMIN_EMAIL,
        password: 'Admin@123456', // This will be hashed by the pre-save middleware
        role: 'admin',
        isMasterAdmin: true,
        hasAdminAccess: true,
        isActive: true,
        registration_through: 'By admin'
      });
      




    } else {
      // Update existing user to master admin and reset password
      user.role = 'admin';
      user.isMasterAdmin = true;
      user.hasAdminAccess = true;
      user.isActive = true;
      user.password = 'Admin@123456'; // This will trigger the pre-save middleware to hash it
      await user.save();
      


    }









    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {

    await mongoose.connection.close();
    process.exit(1);
  }
};

setMasterAdmin();
