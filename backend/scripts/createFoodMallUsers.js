import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';

dotenv.config();

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  process.exit(1);
}

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const toTitleCase = (value) =>
  String(value || '')
    .replace(/[-_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const users = [
  { businessType: 'Food mall / Cafes', email: 'brevonacafe@gmail.com', password: 'BrevonaCafe@123' },
  { businessType: 'Food mall / Hotel', email: 'HotelVelmora@gmail.com', password: 'hotelvelmora@123' },
  { businessType: 'Food mall / Kitchen', email: 'cooklore@gmail.com', password: 'Cooklore@123' },
  { businessType: 'Food mall / Food Courts / Fast Foods', email: 'bitezzyfastfood@gmail.com', password: 'BitezzyFastFood@123' },
  { businessType: 'Food mall / Bakeries', email: 'brevellabakes@gmail.com', password: 'BrevellaBakes@123' },
  { businessType: 'Food mall / Bars & Pubs', email: 'velqore@gmail.com', password: 'Velqore@123' },
  { businessType: 'Food mall / Street vendor', email: 'contact@spiceroutebistro.in', password: 'Spicebistro@1234' },
  { businessType: 'Food mall / Coffee shops', email: 'hello@brewhavencafe.in', password: 'BrewHeaven@1234' },
  { businessType: 'Food mall / Ice cream shops', email: 'hello@frostyscoops.in', password: 'FrostyScoops@7890' },
  { businessType: 'Food mall / Juice bar', email: 'support@freshsqueezejuice.in', password: 'FreshSqueeze@2323' },
  { businessType: 'Food mall / Tea house', email: 'hello@chaijunction.in', password: 'ChaiJunc@234' },
  { businessType: 'Food mall / Catering services', email: 'contact@royalfeastcatering.in', password: 'RoyalFeast@1212' },
];

const main = async () => {
  await mongoose.connect(MONGODB_URI);
  const results = [];

  for (const entry of users) {
    const email = normalizeEmail(entry.email);
    const nameFromEmail = toTitleCase(email.split('@')[0]);
    const businessName = toTitleCase(nameFromEmail || entry.businessType);

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: businessName,
        email,
        password: entry.password,
        role: 'user',
        businessCategory: 'Food Mall',
        businessType: entry.businessType,
        registration_through: 'By admin',
        isActive: true,
      });
      await user.save({ validateBeforeSave: false });
    } else {
      user.name = user.name || businessName;
      user.businessCategory = 'Food Mall';
      user.businessType = entry.businessType;
      user.registration_through = user.registration_through || 'By admin';
      user.isActive = true;
      user.password = entry.password;
      await user.save({ validateBeforeSave: false });
    }

    let restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      restaurant = new Restaurant({
        name: businessName,
        email,
        businessCategory: 'Food Mall',
        businessType: entry.businessType,
        owner: user._id,
        phone: user.phone || '',
        address: user.address ? { street: user.address } : undefined,
      });
      await restaurant.save();
    } else {
      restaurant.name = restaurant.name || businessName;
      restaurant.businessCategory = 'Food Mall';
      restaurant.businessType = entry.businessType;
      if (!restaurant.owner) restaurant.owner = user._id;
      await restaurant.save();
    }

    if (!user.restaurant || String(user.restaurant) !== String(restaurant._id)) {
      user.restaurant = restaurant._id;
      await user.save({ validateBeforeSave: false });
    }

    results.push({ email, businessType: entry.businessType, userId: user._id, restaurantId: restaurant._id });
  }

};

main()
  .then(() => mongoose.disconnect())
  .catch((err) => {
    mongoose.disconnect().finally(() => process.exit(1));
  });
