import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from '../models/Restaurant.js';

dotenv.config();

const checkVerified = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const total = await Restaurant.countDocuments({ isArchived: { $ne: true } });
    const verified = await Restaurant.countDocuments({ 
      isArchived: { $ne: true },
      $or: [
        { verificationStatus: 'verified' },
        { isVerified: true }
      ]
    });
    const pending = await Restaurant.countDocuments({
      isArchived: { $ne: true },
      $or: [
        { verificationStatus: 'pending' },
        {
          verificationStatus: { $exists: false },
          isVerified: { $ne: true }
        }
      ]
    });






    await mongoose.disconnect();
  } catch (error) {

    process.exit(1);
  }
};

checkVerified();