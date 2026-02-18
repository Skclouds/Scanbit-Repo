import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import Payment from '../models/Payment.js';
import Restaurant from '../models/Restaurant.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import { getPaymentSuccessEmailTemplate, getPaymentFailedEmailTemplate, getPaymentPendingEmailTemplate, getAutopayFailedEmailTemplate } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/emailService.js';
import getPublicWebsiteUrl from '../utils/publicUrl.js';
import PDFDocument from 'pdfkit';

const SCANBIT_LOGO_URL = 'https://res.cloudinary.com/dco26pixi/image/upload/v1770330669/Scanbit/branding/ihu7ptsgu31xd5zqayhk.png';
const SCANBIT_CONTACT = {
  tagline: 'One QR. One Digital Look.',
  email: 'support@scanbit.in',
  website: 'https://scanbit.in',
  phone: process.env.SCANBIT_PHONE || '+91 6390420225',
  address: process.env.SCANBIT_ADDRESS || 'India',
};

const router = express.Router();

function getPayNowUrl() {
  return getPublicWebsiteUrl() + '/pricing';
}

function getMetadataAutopay(metadata) {
  if (!metadata) return true;
  const v = typeof metadata.get === 'function' ? metadata.get('autopayEnabled') : metadata.autopayEnabled;
  return v !== false;
}

function getMetadataBillingCycle(metadata) {
  if (!metadata) return 'monthly';
  const v = typeof metadata.get === 'function' ? metadata.get('billingCycle') : metadata.billingCycle;
  return (v === 'yearly' || v === 'monthly') ? v : 'monthly';
}

async function sendPaymentSuccessEmail(payment) {
  const user = await User.findById(payment.user).select('name email').lean();
  if (!user?.email) return;
  const autopayEnabled = getMetadataAutopay(payment.metadata);
  const html = getPaymentSuccessEmailTemplate(
    user.name,
    payment.amount,
    payment.currency,
    payment.plan,
    payment.subscriptionEndDate,
    getPayNowUrl(),
    autopayEnabled
  );
  sendEmail(user.email, 'Payment successful — ScanBit', html).catch(() => {});
}

async function sendPaymentFailedEmail(payment, reason) {
  const user = await User.findById(payment.user).select('name email').lean();
  if (!user?.email) return;
  const html = getPaymentFailedEmailTemplate(
    user.name,
    payment.amount,
    payment.currency,
    payment.plan,
    reason,
    getPayNowUrl()
  );
  sendEmail(user.email, 'Payment issue — ScanBit', html).catch(() => {});
}

async function sendPaymentPendingEmail(payment) {
  const user = await User.findById(payment.user).select('name email').lean();
  if (!user?.email) return;
  const html = getPaymentPendingEmailTemplate(user.name, payment.amount, payment.currency, payment.plan, getPayNowUrl());
  sendEmail(user.email, 'Complete your payment — ScanBit', html).catch(() => {});
}

/** Call when an autopay/renewal charge fails (e.g. from subscription cron). */
async function sendAutopayFailedEmail(userEmail, userName, plan, endDate, reason) {
  if (!userEmail) return;
  const html = getAutopayFailedEmailTemplate(userName, plan, endDate, reason, getPayNowUrl());
  sendEmail(userEmail, 'Auto-renewal failed — ScanBit', html).catch(() => {});
}

// Initialize Razorpay (with error handling for missing keys)
let razorpay;
const TEST_MODE = process.env.PAYMENT_TEST_MODE === 'true' || process.env.NODE_ENV === 'development';

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

  } else if (TEST_MODE) {

    razorpay = null;
  } else {

    razorpay = null;
  }
} catch (error) {

  razorpay = null;
}

/**
 * ============================================
 * RAZORPAY WEBHOOK CONFIGURATION GUIDE
 * ============================================
 * 
 * 1. WEBHOOK URL:
 *    Production: https://your-domain.com/api/payments/webhook
 *    Local Dev (with ngrok): https://your-ngrok-url.ngrok.io/api/payments/webhook
 * 
 * 2. REQUIRED ENVIRONMENT VARIABLES:
 *    - RAZORPAY_KEY_ID: Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)
 *    - RAZORPAY_KEY_SECRET: Your Razorpay Key Secret
 *    - RAZORPAY_WEBHOOK_SECRET: The secret you generate in Razorpay Dashboard
 * 
 * 3. SUPPORTED WEBHOOK EVENTS:
 *    - payment.captured: When payment is successfully captured
 *    - payment.failed: When payment fails
 *    - payment.authorized: When payment is authorized (before capture)
 *    - order.paid: When an order is fully paid
 *    - refund.created: When a refund is initiated
 *    - refund.processed: When a refund is completed
 * 
 * 4. SETUP STEPS IN RAZORPAY DASHBOARD:
 *    a) Go to Settings → Webhooks
 *    b) Click "Add New Webhook"
 *    c) Enter your Webhook URL
 *    d) Click "Create a new secret" and copy it
 *    e) Add the secret to RAZORPAY_WEBHOOK_SECRET in .env
 *    f) Select the events you want to receive
 *    g) Set webhook as Active
 *    h) Save the webhook
 * 
 * 5. TESTING WEBHOOKS LOCALLY:
 *    Use ngrok to expose your local server:
 *    $ ngrok http 5006
 *    Then use the ngrok URL as your webhook URL
 * 
 * ============================================
 */

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order for subscription payment
// @access  Private
router.post('/create-order', protect, [
  body('plan').trim().notEmpty().withMessage('Plan is required'),
  body('businessCategory').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('billingCycle').optional().isIn(['monthly', 'yearly']).withMessage('billingCycle must be monthly or yearly'),
  body('autopayEnabled').optional().isBoolean().withMessage('autopayEnabled must be boolean'),
  body('gstin').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body('billingAddress').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('companyLegalName').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map(e => e.msg).join('. ');
      return res.status(400).json({
        success: false,
        message: msg || 'Validation failed',
        errors: errors.array()
      });
    }

    const { plan, businessCategory, billingCycle = 'monthly', autopayEnabled = true, gstin, billingAddress, companyLegalName } = req.body;
    const userId = req.user.id;

    // Get user and restaurant
    const user = await User.findById(userId).populate('restaurant');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const restaurant = await Restaurant.findById(user.restaurant?._id || user.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get plan pricing
    const category = businessCategory || restaurant.businessCategory || 'Food Mall';
    const planData = await Plan.getPlan(category, plan);

    if (!planData) {
      return res.status(404).json({
        success: false,
        message: `Plan ${plan} not found for category ${category}`
      });
    }

    // Calculate amount based on billing cycle
    let amount = planData.price;
    if (billingCycle === 'yearly') {
      amount = planData.price * 12 * 0.9; // 10% discount for yearly
    }

    // Professional renewal logic: extend from current subscription end when same-plan renewal (active)
    const now = new Date();
    let startDate = new Date(now);
    const currentSub = restaurant.subscription;
    const currentEnd = currentSub?.endDate ? new Date(currentSub.endDate) : null;
    const isActiveSubscription = currentEnd && currentEnd > now;
    const isSamePlanRenewal = isActiveSubscription && (currentSub?.plan || '').trim() === (plan || '').trim();

    if (isSamePlanRenewal) {
      // Renewal: new period starts at current end so customer keeps remaining days
      startDate = new Date(currentEnd);
    }

    const endDate = new Date(startDate);
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Check if Razorpay is configured or running in test mode
    if (!razorpay) {
      if (TEST_MODE) {
        // TEST MODE: Create a simulated order without actual Razorpay call

        const testOrderId = `test_order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const receipt = `sub_${String(restaurant._id).slice(-12)}_${String(Date.now()).slice(-8)}`.slice(0, 40);
        
        // Create payment record for test mode
        const payment = new Payment({
          restaurant: restaurant._id,
          user: userId,
          razorpayOrderId: testOrderId,
          amount: amount,
          currency: planData.currency || 'INR',
          plan: plan,
          businessCategory: category,
          businessType: restaurant.businessType,
          status: 'pending',
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          metadata: {
            billingCycle: billingCycle,
            receipt: receipt,
            testMode: true,
            autopayEnabled: autopayEnabled !== false,
            ...(gstin && { gstin: String(gstin).slice(0, 20) }),
            ...(billingAddress && { billingAddress: String(billingAddress).slice(0, 500) }),
            ...(companyLegalName && { companyLegalName: String(companyLegalName).slice(0, 200) }),
          }
        });

        await payment.save();
        sendPaymentPendingEmail(payment).catch(() => {});

        return res.json({
          success: true,
          testMode: true,
          order: {
            id: testOrderId,
            amount: Math.round(amount * 100),
            currency: planData.currency || 'INR',
            receipt: receipt
          },
          paymentId: payment._id,
          keyId: 'rzp_test_demo_key', // Placeholder for test mode
          message: 'Running in TEST MODE. Use the test payment flow to simulate payment.'
        });
      } else {
        return res.status(503).json({
          success: false,
          message: 'Payment gateway is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.'
        });
      }
    }

    const receipt = `sub_${String(restaurant._id).slice(-12)}_${String(Date.now()).slice(-8)}`.slice(0, 40);
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: planData.currency || 'INR',
      receipt,
      notes: {
        userId: userId.toString(),
        restaurantId: restaurant._id.toString(),
        plan: plan,
        businessCategory: category,
        billingCycle: billingCycle
      }
    });

    // Create payment record
    const payment = new Payment({
      restaurant: restaurant._id,
      user: userId,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: planData.currency || 'INR',
      plan: plan,
      businessCategory: category,
      businessType: restaurant.businessType,
      status: 'pending',
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      metadata: {
        billingCycle: billingCycle,
        receipt: razorpayOrder.receipt,
        autopayEnabled: autopayEnabled !== false,
        ...(gstin && { gstin: String(gstin).slice(0, 20) }),
        ...(billingAddress && { billingAddress: String(billingAddress).slice(0, 500) }),
        ...(companyLegalName && { companyLegalName: String(companyLegalName).slice(0, 200) }),
      }
    });

    await payment.save();
    sendPaymentPendingEmail(payment).catch(() => {});

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      },
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', protect, [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map(e => e.msg).join('. ');
      return res.status(400).json({
        success: false,
        message: msg || 'Validation failed',
        errors: errors.array()
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Check if this is a test mode payment
    const isTestPayment = payment.metadata?.testMode || razorpay_order_id.startsWith('test_order_');
    
    if (isTestPayment && TEST_MODE) {
      // TEST MODE: Simulate successful payment verification

      // Mark payment as completed
      await payment.markAsCompleted(razorpay_payment_id, 'test_signature');

      // Update restaurant subscription
      const restaurant = await Restaurant.findById(payment.restaurant);
      if (restaurant) {
        const autopay = payment.metadata?.autopayEnabled !== false;
        restaurant.subscription = {
          ...(restaurant.subscription && typeof restaurant.subscription.toObject === 'function' ? restaurant.subscription.toObject() : restaurant.subscription),
          plan: payment.plan,
          planPrice: payment.amount,
          status: 'active',
          startDate: payment.subscriptionStartDate,
          endDate: payment.subscriptionEndDate,
          daysRemaining: Math.ceil((payment.subscriptionEndDate - new Date()) / (1000 * 60 * 60 * 24)),
          billingCycle: payment.metadata?.billingCycle || 'monthly',
          autopayEnabled: autopay
        };
        await restaurant.save();
      }

      sendPaymentSuccessEmail(payment).catch(() => {});
      return res.json({
        success: true,
        testMode: true,
        message: 'TEST MODE: Payment verified and subscription activated',
        payment: {
          id: payment._id,
          amount: payment.amount,
          plan: payment.plan,
          status: payment.status,
          subscriptionEndDate: payment.subscriptionEndDate
        }
      });
    }

    // Production mode - check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.'
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

      if (generatedSignature !== razorpay_signature) {
      await payment.markAsFailed('Invalid signature');
      sendPaymentFailedEmail(payment, 'Invalid signature').catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Verify payment with Razorpay
    try {
      const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
      
      if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
        await payment.markAsFailed(`Payment status: ${razorpayPayment.status}`);
        sendPaymentFailedEmail(payment, `Payment status: ${razorpayPayment.status}`).catch(() => {});
        return res.status(400).json({
          success: false,
          message: `Payment not successful. Status: ${razorpayPayment.status}`
        });
      }

      // Update payment record
      await payment.markAsCompleted(razorpay_payment_id, razorpay_signature);

      // Update restaurant subscription
      const restaurant = await Restaurant.findById(payment.restaurant);
      if (restaurant) {
        const autopay = payment.metadata?.autopayEnabled !== false;
        const existingSub = restaurant.subscription && typeof restaurant.subscription.toObject === 'function' ? restaurant.subscription.toObject() : (restaurant.subscription || {});
        restaurant.subscription = {
          ...existingSub,
          plan: payment.plan,
          planPrice: payment.amount,
          status: 'active',
          startDate: payment.subscriptionStartDate,
          endDate: payment.subscriptionEndDate,
          daysRemaining: Math.ceil((payment.subscriptionEndDate - new Date()) / (1000 * 60 * 60 * 24)),
          billingCycle: payment.metadata?.billingCycle || 'monthly',
          autopayEnabled: autopay
        };
        await restaurant.save();
      }

      sendPaymentSuccessEmail(payment).catch(() => {});

      res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        payment: {
          id: payment._id,
          amount: payment.amount,
          plan: payment.plan,
          status: payment.status,
          subscriptionEndDate: payment.subscriptionEndDate
        }
      });
    } catch (razorpayError) {
      await payment.markAsFailed(razorpayError.message);
      sendPaymentFailedEmail(payment, razorpayError.message).catch(() => {});
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment with Razorpay'
      });
    }
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Razorpay webhook handler
// @access  Public (Razorpay calls this)
// Webhook URL: https://your-domain.com/api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const timestamp = new Date().toISOString();
  const { logSuspicious } = await import('../utils/logger.js');
  const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;

    // Verify webhook signature
    if (!signature) {
      logSuspicious('Webhook signature missing', { ip });
      return res.status(400).json({
        success: false,
        message: 'Webhook signature missing'
      });
    }

    // Check if webhook secret is configured
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {

      return res.status(500).json({
        success: false,
        message: 'Webhook secret not configured'
      });
    }

    // Verify signature
    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');
      
      if (expectedSignature !== signature) {
        logSuspicious('Webhook invalid signature', { ip });
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }

    } catch (sigError) {

      return res.status(400).json({
        success: false,
        message: 'Webhook signature verification failed'
      });
    }

    const event = JSON.parse(webhookBody.toString());
    const { event: eventType, payload, created_at } = event;
    


    // Handle different webhook events
    switch (eventType) {
      case 'payment.captured':

        await handlePaymentCaptured(payload.payment.entity);

        break;
        
      case 'payment.failed':

        await handlePaymentFailed(payload.payment.entity);

        break;
        
      case 'payment.authorized':

        // Auto-capture is usually enabled, so this is just logged
        break;
        
      case 'order.paid':

        await handleOrderPaid(payload.order.entity);

        break;
        
      case 'refund.created':

        await handleRefundCreated(payload.refund?.entity);
        break;
        
      case 'refund.processed':

        break;
        
      default:

    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ 
      success: true,
      message: `Webhook ${eventType} processed`,
      timestamp
    });
    
  } catch (error) {
    const { logSuspicious } = await import('../utils/logger.js');
    logSuspicious('Webhook processing error', { error: error.message });
    res.status(200).json({
      success: false,
      message: 'Webhook processing encountered an error',
      errorCode: 'WEBHOOK_ERROR',
      ...(process.env.NODE_ENV === 'development' ? { debug: error.message } : {}),
    });
  }
});

// Helper function to handle refund created
async function handleRefundCreated(refundEntity) {
  try {
    if (!refundEntity) return;
    
    const payment = await Payment.findOne({ 
      razorpayPaymentId: refundEntity.payment_id 
    });

    if (payment) {
      payment.refundStatus = 'processing';
      payment.refundAmount = (refundEntity.amount / 100);
      payment.metadata = {
        ...payment.metadata,
        refundId: refundEntity.id,
        refundCreatedAt: new Date()
      };
      await payment.save();

    }
  } catch (error) {

  }
}

// @route   POST /api/payments/test-payment
// @desc    Simulate a test payment (TEST MODE ONLY)
// @access  Private
router.post('/test-payment', protect, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
], async (req, res) => {
  try {
    if (!TEST_MODE) {
      return res.status(403).json({
        success: false,
        message: 'Test payments are only available in development/test mode'
      });
    }

    const { orderId } = req.body;

    // Find the payment record
    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`
      });
    }

    // Generate test payment credentials
    const testPaymentId = `test_pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const testSignature = 'test_signature_' + crypto.randomBytes(16).toString('hex');

    // Mark payment as completed
    await payment.markAsCompleted(testPaymentId, testSignature);

    const restaurant = await Restaurant.findById(payment.restaurant);
    if (restaurant) {
      const autopay = getMetadataAutopay(payment.metadata);
      const existingSub = restaurant.subscription && typeof restaurant.subscription.toObject === 'function'
        ? restaurant.subscription.toObject()
        : (restaurant.subscription || {});
      restaurant.subscription = {
        ...existingSub,
        plan: payment.plan,
        planPrice: payment.amount,
        status: 'active',
        startDate: payment.subscriptionStartDate,
        endDate: payment.subscriptionEndDate,
        daysRemaining: Math.ceil((new Date(payment.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)),
        billingCycle: getMetadataBillingCycle(payment.metadata) || existingSub.billingCycle || 'monthly',
        autopayEnabled: autopay
      };
      await restaurant.save();
    }


    res.json({
      success: true,
      testMode: true,
      message: 'Test payment completed successfully',
      razorpay_order_id: orderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: testSignature,
      payment: {
        id: payment._id,
        amount: payment.amount,
        plan: payment.plan,
        status: 'completed',
        subscriptionEndDate: payment.subscriptionEndDate
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process test payment'
    });
  }
});

// Helper function to handle payment captured
async function handlePaymentCaptured(paymentEntity) {
  try {
    if (!razorpay) {
      return;
    }

    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id
    });

    if (payment && payment.status === 'pending') {
      await payment.markAsCompleted(
        paymentEntity.id,
        paymentEntity.signature || ''
      );

      const restaurant = await Restaurant.findById(payment.restaurant);
      if (restaurant) {
        const autopay = getMetadataAutopay(payment.metadata);
        const existingSub = restaurant.subscription && typeof restaurant.subscription.toObject === 'function'
          ? restaurant.subscription.toObject()
          : (restaurant.subscription || {});
        restaurant.subscription = {
          ...existingSub,
          plan: payment.plan,
          planPrice: payment.amount,
          status: 'active',
          startDate: payment.subscriptionStartDate,
          endDate: payment.subscriptionEndDate,
          daysRemaining: Math.ceil((new Date(payment.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)),
          billingCycle: getMetadataBillingCycle(payment.metadata) || existingSub.billingCycle || 'monthly',
          autopayEnabled: autopay
        };
        await restaurant.save();
      }
      sendPaymentSuccessEmail(payment).catch(() => {});
    }
  } catch (error) {
    // Log in production if needed
  }
}

// Helper function to handle payment failed
async function handlePaymentFailed(paymentEntity) {
  try {
    const payment = await Payment.findOne({ 
      razorpayOrderId: paymentEntity.order_id 
    });

    if (payment) {
      const failureReason = paymentEntity.error_description ||
                           paymentEntity.error_code ||
                           paymentEntity.error_reason ||
                           'Payment failed';
      await payment.markAsFailed(failureReason);
      sendPaymentFailedEmail(payment, failureReason).catch(() => {});
    }
  } catch (_error) {}
}

// Helper function to handle order paid
async function handleOrderPaid(orderEntity) {
  try {
    if (!razorpay) {

      return;
    }

    const payment = await Payment.findOne({ 
      razorpayOrderId: orderEntity.id 
    });

    if (payment && payment.status === 'pending') {
      // Fetch payment details from Razorpay
      const payments = await razorpay.orders.fetchPayments(orderEntity.id);
      if (payments.items && payments.items.length > 0) {
        const paymentEntity = payments.items[0];
        await handlePaymentCaptured(paymentEntity);
      }
    }
  } catch (error) {

  }
}

// @route   GET /api/payments/webhook-status
// @desc    Check webhook configuration status
// @access  Private (Admin only)
router.get('/webhook-status', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpayConfigured = !!razorpay;
    
    res.json({
      success: true,
      status: {
        razorpayConfigured,
        webhookSecretConfigured: !!webhookSecret,
        webhookUrl: `${process.env.BASE_URL || 'https://your-domain.com'}/api/payments/webhook`,
        supportedEvents: [
          'payment.captured',
          'payment.failed', 
          'payment.authorized',
          'order.paid',
          'refund.created',
          'refund.processed'
        ],
        setupInstructions: {
          step1: 'Go to Razorpay Dashboard → Settings → Webhooks',
          step2: 'Click "Add New Webhook"',
          step3: 'Enter your Webhook URL',
          step4: 'Generate a Secret and add it to RAZORPAY_WEBHOOK_SECRET in your .env',
          step5: 'Select events: payment.captured, payment.failed, order.paid, refund.created',
          step6: 'Save the webhook configuration'
        }
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get webhook status'
    });
  }
});

// Helper function to mark old pending payments as failed
async function markOldPendingPaymentsAsFailed() {
  try {
    // Mark payments that have been pending for more than 24 hours as failed
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Payment.updateMany(
      { 
        status: 'pending',
        createdAt: { $lt: twentyFourHoursAgo },
        razorpayPaymentId: null // Only mark payments that were never completed
      },
      { 
        $set: { 
          status: 'failed',
          failureReason: 'Payment timeout: Payment was not completed within 24 hours',
          updatedAt: new Date()
        }
      }
    );

  } catch (_error) {}
}

// @route   GET /api/payments/history
// @desc    Get payment history for user
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    // Mark old pending payments as failed before fetching
    await markOldPendingPaymentsAsFailed();

    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { user: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Ensure we get ALL payments including failed ones - no filtering by status unless explicitly requested
    const payments = await Payment.find(query)
      .populate('restaurant', 'name email businessCategory businessType logo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 100)
      .skip((parseInt(page) - 1) * (parseInt(limit) || 100))
      .lean();

    const total = await Payment.countDocuments(query);
    
    // Include billingCycle from metadata for Pay now / checkout prefill
    const data = payments.map((p) => {
      const meta = p.metadata || {};
      const billingCycle = (typeof meta.get === 'function' ? meta.get('billingCycle') : meta.billingCycle) || 'monthly';
      return { ...p, billingCycle };
    });

    const statusCounts = {
      all: total,
      completed: await Payment.countDocuments({ user: userId, status: 'completed' }),
      pending: await Payment.countDocuments({ user: userId, status: 'pending' }),
      failed: await Payment.countDocuments({ user: userId, status: 'failed' }),
    };

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 100,
        total,
        pages: Math.ceil(total / (parseInt(limit) || 100))
      },
      statusCounts // Include status breakdown for debugging
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history'
    });
  }
});

// @route   GET /api/payments/:id/invoice
// @desc    Download professional invoice as PDF (ScanBit logo, contact details)
// @access  Private
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('restaurant', 'name email businessCategory businessType')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is only available for completed payments. Complete the payment first or use Pay now for pending orders.',
      });
    }

    const meta = payment.metadata || {};
    const billingCycle = (typeof meta.get === 'function' ? meta.get('billingCycle') : meta.billingCycle) || 'monthly';
    const gstin = (typeof meta.get === 'function' ? meta.get('gstin') : meta.gstin) || '';
    const companyLegalName = (typeof meta.get === 'function' ? meta.get('companyLegalName') : meta.companyLegalName) || '';
    const billingAddress = (typeof meta.get === 'function' ? meta.get('billingAddress') : meta.billingAddress) || {};
    const addrStr = typeof billingAddress === 'string' ? billingAddress : [
      billingAddress.line1,
      billingAddress.line2,
      [billingAddress.city, billingAddress.state, billingAddress.pincode].filter(Boolean).join(', '),
      billingAddress.country,
    ].filter(Boolean).join(', ') || '—';

    const invoiceNumber = `INV-${new Date(payment.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${String(payment._id).slice(-6).toUpperCase()}`;
    const invoiceDate = new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const amount = Number(payment.amount);
    const currency = payment.currency || 'INR';
    // Use "INR" not "₹" so PDF renders correctly (Helvetica has no rupee symbol, else shows as ¹)
    const amountStr = currency === 'INR' ? 'INR ' + Number(amount).toLocaleString('en-IN') : currency + ' ' + Number(amount).toLocaleString();
    const planLabel = `${payment.plan || 'Subscription'} Plan — ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'}`;
    const customerName = payment.user?.name || payment.restaurant?.name || 'Customer';
    const customerEmail = payment.user?.email || payment.restaurant?.email || '—';
    const businessName = payment.restaurant?.name || '—';
    const periodStr = `${new Date(payment.subscriptionStartDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} – ${new Date(payment.subscriptionEndDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
    const paymentId = payment.razorpayPaymentId || payment.razorpayOrderId || '—';

    let logoBuffer = null;
    try {
      const logoRes = await fetch(SCANBIT_LOGO_URL);
      if (logoRes.ok) logoBuffer = Buffer.from(await logoRes.arrayBuffer());
    } catch (e) {
      // continue without logo
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ScanBit-Invoice-${invoiceNumber}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    const pageWidth = doc.page.width - 100;
    const margin = 50;
    const rightEdge = margin + pageWidth;
    let y = 50;

    // ----- Header: Logo + contact -----
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, margin, y, { width: 120 });
      } catch (_) {}
      y += 48;
    }
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(SCANBIT_CONTACT.tagline, margin, y);
    y += 14;
    doc.fontSize(9).fillColor('#475569');
    doc.text('Email: ' + SCANBIT_CONTACT.email, margin, y);
    y += 12;
    doc.text('Phone: ' + SCANBIT_CONTACT.phone, margin, y);
    y += 12;
    doc.text('Website: ' + SCANBIT_CONTACT.website, margin, y);
    y += 12;
    doc.text('Address: ' + SCANBIT_CONTACT.address, margin, y);
    y += 24;

    doc.moveTo(margin, y).lineTo(rightEdge, y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    y += 20;

    // ----- Invoice title + meta (right-aligned) -----
    doc.fontSize(14).fillColor('#1f2937').font('Helvetica-Bold').text('INVOICE', margin, y);
    doc.font('Helvetica').fontSize(9).fillColor('#64748b');
    doc.text(invoiceNumber, margin, y, { width: pageWidth, align: 'right' });
    y += 14;
    doc.text('Invoice Date: ' + invoiceDate, margin, y, { width: pageWidth, align: 'right' });
    y += 12;
    doc.text('Payment ID: ' + paymentId, margin, y, { width: pageWidth, align: 'right' });
    y += 22;

    // ----- Bill To -----
    doc.fontSize(9).fillColor('#64748b').font('Helvetica-Bold').text('BILL TO', margin, y);
    y += 14;
    doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(businessName || customerName, margin, y);
    y += 14;
    doc.font('Helvetica').fontSize(9).fillColor('#475569').text(customerEmail, margin, y);
    y += 12;
    if (addrStr && addrStr !== '—') {
      doc.text(addrStr, margin, y, { width: pageWidth });
      y += 12;
    }
    if (companyLegalName) {
      doc.text('Legal name: ' + companyLegalName, margin, y);
      y += 12;
    }
    if (gstin) {
      doc.text('GSTIN: ' + gstin, margin, y);
      y += 12;
    }
    y += 18;

    // ----- Table -----
    const col1 = margin;
    const col2 = margin + 260;
    const col3 = rightEdge - 90;
    const rowH = 18;

    doc.fontSize(9).fillColor('#64748b').font('Helvetica-Bold');
    doc.text('Description', col1, y);
    doc.text('Period', col2, y);
    doc.text(currency === 'INR' ? 'Amount (INR)' : 'Amount (' + currency + ')', col3, y, { width: 85, align: 'right' });
    y += rowH;

    doc.moveTo(margin, y).lineTo(rightEdge, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    y += 10;

    doc.font('Helvetica').fontSize(10).fillColor('#1f2937');
    doc.text(planLabel, col1, y, { width: 240 });
    doc.text(periodStr, col2, y, { width: 180 });
    doc.text(amountStr, col3, y, { width: 85, align: 'right' });
    y += rowH + 8;

    doc.moveTo(margin, y).lineTo(rightEdge, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    y += 12;

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a');
    doc.text('Total Paid', col1, y);
    doc.fillColor('#15803d').text(amountStr, col3, y, { width: 85, align: 'right' });
    y += 36;

    doc.moveTo(margin, y).lineTo(rightEdge, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    y += 18;
    doc.font('Helvetica').fontSize(9).fillColor('#64748b');
    doc.text('This is a computer-generated invoice. For queries: ' + SCANBIT_CONTACT.email + ' | ' + SCANBIT_CONTACT.phone, margin, y, { width: pageWidth, align: 'center' });
    y += 12;
    doc.text(SCANBIT_CONTACT.website, margin, y, { width: pageWidth, align: 'center' });

    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to generate invoice',
      });
    }
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('restaurant', 'name email businessCategory businessType logo')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment'
    });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund
// @access  Private (Admin only)
router.post('/refund', protect, [
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Invalid refund amount'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { paymentId, amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    if (!payment.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID not found'
      });
    }

    // Process refund with Razorpay
    const refundAmount = amount || payment.amount;
    const razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100), // Convert to paise
      notes: {
        reason: reason || 'Refund processed by admin',
        refunded_by: req.user.id.toString()
      }
    });

    // Update payment record
    await payment.processRefund(refundAmount, reason);

    // Update restaurant subscription if needed
    if (refundAmount >= payment.amount) {
      const restaurant = await Restaurant.findById(payment.restaurant);
      if (restaurant) {
        restaurant.subscription.status = 'cancelled';
        await restaurant.save();
      }
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: razorpayRefund.id,
        amount: razorpayRefund.amount / 100,
        status: razorpayRefund.status
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
});

export { sendAutopayFailedEmail };
export default router;
