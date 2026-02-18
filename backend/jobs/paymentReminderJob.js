/**
 * Payment reminder job — industry standard: 7, 3, and 1 day(s) before subscription expiry.
 * Runs daily; sends one reminder per restaurant when days remaining is 7, 3, or 1 (or 0 for "expires today").
 */
import cron from 'node-cron';
import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { getPaymentReminderEmailTemplate } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/emailService.js';
import getPublicWebsiteUrl from '../utils/publicUrl.js';

const REMINDER_DAYS = [7, 3, 1, 0];

function getPayNowUrl() {
  return getPublicWebsiteUrl() + '/pricing';
}

function getDaysRemaining(endDate) {
  if (!endDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

export async function runPaymentReminders() {
  if (!mongoose.connection.readyState) return;
  try {
    const now = new Date();
    const future = new Date(now);
    future.setDate(future.getDate() + 8);

    const restaurants = await Restaurant.find({
      'subscription.status': 'active',
      'subscription.endDate': { $gte: now, $lte: future },
      owner: { $exists: true, $ne: null }
    })
      .select('name owner subscription.plan subscription.endDate subscription.autopayEnabled')
      .lean();

    for (const rest of restaurants) {
      const endDate = rest.subscription?.endDate;
      const daysLeft = getDaysRemaining(endDate);
      if (daysLeft === null || !REMINDER_DAYS.includes(daysLeft)) continue;

      const owner = await User.findById(rest.owner).select('name email').lean();
      if (!owner?.email) continue;

      const dayLabel = daysLeft === 0 ? 'today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
      const autopayEnabled = rest.subscription?.autopayEnabled === true;
      const html = getPaymentReminderEmailTemplate(
        owner.name,
        rest.name,
        rest.subscription?.plan || 'Subscription',
        endDate,
        dayLabel,
        getPayNowUrl(),
        autopayEnabled
      );
      await sendEmail(owner.email, `Subscription expiring in ${dayLabel} — ScanBit`, html);
    }
  } catch (_err) {}
}

/**
 * Start cron: run every day at 9:00 AM server time.
 */
export function startPaymentReminderCron() {
  cron.schedule('0 9 * * *', () => runPaymentReminders(), { timezone: 'Asia/Kolkata' });
}

export default { runPaymentReminders, startPaymentReminderCron };
