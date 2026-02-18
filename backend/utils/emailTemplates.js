// Professional email templates with website branding
// Use canonical public URL (scanbit.in) in all emails — never development.scanbit.in
import { getPublicWebsiteUrl } from './publicUrl.js';

const FRONTEND_URL = getPublicWebsiteUrl();
const APP_NAME = 'ScanBit';
const APP_TAGLINE = 'One QR. One Digital Look.';
const COMPANY_EMAIL = 'support@scanbit.in';
const COMPANY_WEBSITE = 'https://scanbit.in';
// const LOGO_URL = `${COMPANY_WEBSITE}/logo.svg`; // Logo from public folder
const LOGO_URL ='https://res.cloudinary.com/dco26pixi/image/upload/v1770330669/Scanbit/branding/ihu7ptsgu31xd5zqayhk.png';

// Base email template with branding
const getEmailTemplate = (content, subject, type = 'verification') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f4f4f4ff 0%, #ffffffff 100%); padding: 40px 30px; text-align: center;">
              <div style="margin-bottom: 16px;">
                <img src="${LOGO_URL}" alt="${APP_NAME}" style="height: 60px; width: auto; max-width: 200px; margin: 0 auto; display: block;" />
              </div>
              <h1 style="margin: 0; color: #ff8c00ff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                ${APP_NAME}
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(0, 0, 0, 0.9); font-size: 16px; font-weight: 400;">
                ${APP_TAGLINE}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Need help? Contact us at <a href="mailto:${COMPANY_EMAIL}" style="color: #f97316; text-decoration: none; font-weight: 500;">${COMPANY_EMAIL}</a>
                    </p>
                    <div style="margin: 20px 0;">
                      <a href="${COMPANY_WEBSITE}" style="display: inline-block; margin: 0 12px; color: #f97316; text-decoration: none; font-size: 14px; font-weight: 500;">Visit Website</a>
                      <span style="color: #d1d5db;">|</span>
                      <a href="${COMPANY_WEBSITE}/terms-of-service" style="display: inline-block; margin: 0 12px; color: #f97316; text-decoration: none; font-size: 14px; font-weight: 500;">Terms of Service</a>
                      <span style="color: #d1d5db;">|</span>
                      <a href="${COMPANY_WEBSITE}/privacy-policy" style="display: inline-block; margin: 0 12px; color: #f97316; text-decoration: none; font-size: 14px; font-weight: 500;">Privacy Policy</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                      This email was sent to you because you ${type === 'verification' ? 'requested' : 'attempted to login'}. If you didn't request this, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

// OTP verification email template
export const getOTPEmailTemplate = (otp, type = 'verification') => {
  const title = type === 'login' ? 'Login Verification' : 'Email Verification';
  const message = type === 'login' 
    ? 'You are attempting to login to your Scanbit account. Please use the following OTP to complete your login:'
    : 'Thank you for registering with Scanbit! Please use the following OTP to verify your email address:';
  
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700; line-height: 1.3;">
      ${title}
    </h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
      ${message}
    </p>
    
    <!-- OTP Box -->
    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; border: 2px dashed #d1d5db;">
      <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
        Your Verification Code
      </p>
      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; display: inline-block; margin: 0 auto;">
        <span style="font-size: 36px; font-weight: 700; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace; line-height: 1;">
          ${otp}
        </span>
      </div>
    </div>
    
    <!-- Important Info -->
    <div style="background-color: #fef3c7; border-left: 4px solid #fbd592ff; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>. For your security, never share this code with anyone.
      </p>
    </div>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      If you didn't ${type === 'login' ? 'attempt to login' : 'request this verification code'}, please ignore this email or contact our support team immediately.
    </p>
    
    <!-- Security Tips -->
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
        🔒 Security Tips:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
        <li>Never share your OTP with anyone</li>
        <li>Scanbit staff will never ask for your verification code</li>
        <li>If you suspect unauthorized access, contact support immediately</li>
        <li>Keep your account password secure and unique</li>
      </ul>
    </div>
  `;
  
  return getEmailTemplate(content, title, type);
};

// Welcome email template (for after successful registration)
export const getWelcomeEmailTemplate = (userName) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700; line-height: 1.3;">
      Welcome to ${APP_NAME}! 🎉
    </h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Thank you for joining ${APP_NAME}! We're excited to help you transform your business with digital solutions.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${COMPANY_WEBSITE}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Get Started
      </a>
    </div>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Need help? Check out our <a href="${COMPANY_WEBSITE}/help-center" style="color: #f97316; text-decoration: none;">Help Center</a> or contact us at <a href="mailto:${COMPANY_EMAIL}" style="color: #f97316; text-decoration: none;">${COMPANY_EMAIL}</a>.
    </p>
  `;
  
  return getEmailTemplate(content, `Welcome to ${APP_NAME}!`, 'welcome');
};

// Password reset email template (with code instead of link)
export const getPasswordResetEmailTemplate = (resetCode, userName) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700; line-height: 1.3;">
      Reset Your Password 🔐
    </h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password for your ${APP_NAME} account. Use the verification code below to reset your password:
    </p>
    
    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; border: 2px dashed #d1d5db;">
      <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
        Your Password Reset Code
      </p>
      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; display: inline-block; margin: 0 auto;">
        <span style="font-size: 36px; font-weight: 700; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace; line-height: 1;">
          ${resetCode}
        </span>
      </div>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #fcda9fff; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>⚠️ Important:</strong> This code will expire in <strong>1 hour</strong>. Enter this code on the password reset page along with your new password. If you didn't request a password reset, please ignore this email or contact support immediately.
      </p>
    </div>
    
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Go to the login page and click "Forgot password?" to enter this code and reset your password.
    </p>
    
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
        🔒 Security Tips:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
        <li>Never share your password reset link with anyone</li>
        <li>Scanbit staff will never ask for your password</li>
        <li>If you didn't request this, your account may be at risk - contact support immediately</li>
        <li>Choose a strong, unique password that you don't use elsewhere</li>
      </ul>
    </div>
  `;
  
  return getEmailTemplate(content, 'Reset Your Password - Scanbit', 'password-reset');
};

// --- Registration success (after signup) ---
export const getRegistrationSuccessEmailTemplate = (userName, businessName, loginUrl) => {
  const url = loginUrl || `${FRONTEND_URL}/login`;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Welcome to ${APP_NAME} — You're Registered</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Hi ${userName || 'there'},</p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Your account has been successfully created. <strong>${businessName || 'Your business'}</strong> is now on ${APP_NAME}.</p>
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #166534; font-size: 14px;"><strong>✓</strong> Account verified &amp; ready. Complete onboarding in your dashboard to get your digital menu and QR code.</p>
    </div>
    <p style="margin: 24px 0;"><a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Go to Dashboard</a></p>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Questions? Contact <a href="mailto:${COMPANY_EMAIL}" style="color: #f97316;">${COMPANY_EMAIL}</a>.</p>
  `;
  return getEmailTemplate(content, `Registration successful — ${APP_NAME}`, 'welcome');
};

// --- Onboarding completed ---
export const getOnboardingSuccessEmailTemplate = (userName, businessName, dashboardUrl) => {
  const url = dashboardUrl || `${FRONTEND_URL}/dashboard`;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Onboarding complete — you're all set</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Hi ${userName || 'there'},</p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Your business profile for <strong>${businessName || 'your business'}</strong> is ready. Your QR code and digital presence are now active.</p>
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #166534;"><strong>Next:</strong> Download your QR code from the dashboard and share your digital menu link with customers.</p>
    </div>
    <p style="margin: 24px 0;"><a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Open Dashboard</a></p>
  `;
  return getEmailTemplate(content, `Onboarding successful — ${APP_NAME}`, 'onboarding');
};

// Theme backgrounds by category (professional image-style gradients)
const QR_EMAIL_THEMES = {
  'food mall': { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)', accent: '#b45309', label: 'Food & Dining' },
  'restaurant': { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', accent: '#b45309', label: 'Restaurant' },
  'retail': { bg: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #60a5fa 100%)', accent: '#1d4ed8', label: 'Retail' },
  'creative': { bg: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)', accent: '#6b21a8', label: 'Creative' },
  'portfolio': { bg: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)', accent: '#0f766e', label: 'Portfolio' },
  'wellness': { bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', accent: '#047857', label: 'Wellness' },
  'default': { bg: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', accent: '#f97316', label: 'Business' },
};
function getQRTheme(businessCategory, businessType) {
  const key = ((businessCategory || '') + ' ' + (businessType || '')).toLowerCase();
  if (/food|restaurant|menu|dining|cafe/.test(key)) return QR_EMAIL_THEMES['food mall'];
  if (/retail|ecommerce|shop|store/.test(key)) return QR_EMAIL_THEMES['retail'];
  if (/creative|design|agency|studio/.test(key)) return QR_EMAIL_THEMES['creative'];
  if (/portfolio|professional|legal|consult/.test(key)) return QR_EMAIL_THEMES['portfolio'];
  if (/wellness|health|fitness/.test(key)) return QR_EMAIL_THEMES['wellness'];
  return QR_EMAIL_THEMES['default'];
}

// --- QR code ready (business name at top, themed background; QR image via cid:qrcode) ---
export const getQRCodeReadyEmailTemplate = (businessName, businessType, businessCategory, menuUrl, hasQRAttachment = true) => {
  const theme = getQRTheme(businessCategory, businessType);
  const qrImg = hasQRAttachment ? '<img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; display: block; margin: 20px auto;" />' : '';
  const content = `
    <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 22px; font-weight: 700;">Your QR code is ready</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Use it on your table tents, flyers, and signage so customers can scan and view your digital menu.</p>
    <div style="background: ${theme.bg}; border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0; border: 2px solid rgba(0,0,0,0.06);">
      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: ${theme.accent};">${(businessName || 'Your Business').replace(/</g, '&lt;')}</p>
      <p style="margin: 0 0 16px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">${theme.label}</p>
      ${qrImg}
      <p style="margin: 16px 0 0 0;"><a href="${(menuUrl || '').replace(/"/g, '&quot;')}" style="color: ${theme.accent}; font-weight: 600;">Open digital menu</a></p>
    </div>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Save the QR image from this email or download it anytime from your <a href="${FRONTEND_URL}/dashboard" style="color: #f97316;">dashboard</a>.</p>
  `;
  return getEmailTemplate(content, `Your QR code — ${APP_NAME}`, 'qr');
};

// --- Payment success ---
export const getPaymentSuccessEmailTemplate = (userName, amount, currency, plan, endDate, payNowUrl, autopayEnabled = true) => {
  const formatted = currency === 'INR' ? `₹${Number(amount).toFixed(2)}` : `${currency} ${Number(amount).toFixed(2)}`;
  const autopayOn = autopayEnabled !== false;
  const autopayBlurb = autopayOn
    ? '<p style="margin: 8px 0 0 0; color: #166534; font-size: 14px;">Auto-renew is <strong>on</strong>. We’ll charge your saved payment method at the next renewal date.</p>'
    : '<p style="margin: 8px 0 0 0; color: #166534; font-size: 14px;">Auto-renew is <strong>off</strong>. Renew manually before the end date from your dashboard or pricing page.</p>';
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Payment successful</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Hi ${userName || 'there'},</p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Your payment of <strong>${formatted}</strong> for <strong>${plan || 'subscription'}</strong> was completed successfully.</p>
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #166534;">Subscription active until <strong>${endDate ? new Date(endDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—'}</strong>.</p>
      ${autopayBlurb}
    </div>
    <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px;">Need to upgrade or renew? <a href="${payNowUrl || FRONTEND_URL + '/pricing'}" style="color: #f97316;">View plans</a></p>
  `;
  return getEmailTemplate(content, `Payment successful — ${APP_NAME}`, 'payment');
};

// --- Payment failed (with Pay Now) ---
export const getPaymentFailedEmailTemplate = (userName, amount, currency, plan, reason, payNowUrl) => {
  const formatted = currency === 'INR' ? `₹${Number(amount).toFixed(2)}` : `${currency} ${Number(amount).toFixed(2)}`;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Payment could not be completed</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Hi ${userName || 'there'},</p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">We were unable to process your payment of <strong>${formatted}</strong> for <strong>${plan || 'subscription'}</strong>.</p>
    ${reason ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 24px 0;"><p style="margin: 0; color: #991b1b;">${String(reason).replace(/</g, '&lt;')}</p></div>` : ''}
    <p style="margin: 24px 0;"><a href="${payNowUrl || FRONTEND_URL + '/pricing'}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Pay now</a></p>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">If the problem persists, try another card or contact your bank. Need help? <a href="mailto:${COMPANY_EMAIL}" style="color: #f97316;">${COMPANY_EMAIL}</a></p>
  `;
  return getEmailTemplate(content, `Payment issue — ${APP_NAME}`, 'payment');
};

// --- Payment pending (Pay Now CTA) ---
export const getPaymentPendingEmailTemplate = (userName, amount, currency, plan, payNowUrl) => {
  const formatted = currency === 'INR' ? `₹${Number(amount).toFixed(2)}` : `${currency} ${Number(amount).toFixed(2)}`;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Complete your payment</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Hi ${userName || 'there'},</p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Your order for <strong>${formatted}</strong> — <strong>${plan || 'subscription'}</strong> is pending. Complete payment to activate your plan.</p>
    <p style="margin: 24px 0;"><a href="${payNowUrl || FRONTEND_URL + '/pricing'}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Pay now</a></p>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">This link will take you to the checkout page to complete payment securely.</p>
  `;
  return getEmailTemplate(content, `Complete your payment — ${APP_NAME}`, 'payment');
};

// --- New review received (to business owner) ---
export const getReviewReceivedEmailTemplate = (ownerName, businessName, reviewerName, rating, comment, reviewsUrl) => {
  const stars = '★'.repeat(Math.min(5, Math.max(0, Math.round(rating)))) + '☆'.repeat(5 - Math.min(5, Math.max(0, Math.round(rating))));
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700;">New customer review</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Hi ${ownerName || 'there'},</p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;"><strong>${(reviewerName || 'A customer').replace(/</g, '&lt;')}</strong> left a review for <strong>${(businessName || 'your business').replace(/</g, '&lt;')}</strong>.</p>
    <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; font-size: 18px; color: #f59e0b;">${stars}</p>
      ${comment ? `<p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.5;">"${String(comment).replace(/</g, '&lt;').replace(/"/g, '&quot;')}"</p>` : '<p style="margin: 0; color: #6b7280;">No comment provided.</p>'}
    </div>
    <p style="margin: 24px 0 0 0;"><a href="${reviewsUrl || FRONTEND_URL}" style="color: #f97316; font-weight: 600;">View all reviews</a></p>
  `;
  return getEmailTemplate(content, `New review — ${APP_NAME}`, 'review');
};

// --- Payment reminder (subscription expiring) ---
export const getPaymentReminderEmailTemplate = (userName, businessName, plan, endDate, daysLeft, payNowUrl, autopayEnabled = false) => {
  const autopayOn = autopayEnabled === true;
  const renewalDateStr = endDate ? new Date(endDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—';
  const autopayLine = autopayOn
    ? `<p style="margin: 8px 0 0 0; color: #92400e;">Auto-renew is <strong>on</strong>. We’ll charge your saved payment method on the renewal date. No action needed unless you want to update your card or turn off auto-renew.</p>`
    : `<p style="margin: 8px 0 0 0; color: #92400e;">Renew by <strong>${renewalDateStr}</strong> to keep your digital menu and QR active.</p>`;
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Subscription reminder</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Hi ${userName || 'there'},</p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Your <strong>${plan || 'subscription'}</strong> for <strong>${(businessName || 'your business').replace(/</g, '&lt;')}</strong> will expire in <strong>${daysLeft}</strong>.</p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
      ${autopayLine}
    </div>
    <p style="margin: 24px 0;"><a href="${payNowUrl || FRONTEND_URL + '/pricing'}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">${autopayOn ? 'Update payment or renew' : 'Renew now'}</a></p>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">To manage billing or auto-renew, visit your <a href="${FRONTEND_URL}/dashboard" style="color: #f97316;">dashboard</a>.</p>
  `;
  return getEmailTemplate(content, `Subscription expiring in ${daysLeft} — ${APP_NAME}`, 'reminder');
};

// --- Autopay charge failed (renewal attempt could not be charged) ---
export const getAutopayFailedEmailTemplate = (userName, plan, endDate, reason, payNowUrl) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700;">Auto-renewal charge failed</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">Hi ${userName || 'there'},</p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">We couldn’t charge your saved payment method for your <strong>${plan || 'subscription'}</strong> renewal.</p>
    ${reason ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 24px 0;"><p style="margin: 0; color: #991b1b;">${String(reason).replace(/</g, '&lt;')}</p></div>` : ''}
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e;">Subscription ends <strong>${endDate ? new Date(endDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—'}</strong>. Update your payment method or pay manually to avoid interruption.</p>
    </div>
    <p style="margin: 24px 0;"><a href="${payNowUrl || FRONTEND_URL + '/pricing'}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Update payment & renew</a></p>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Need help? <a href="mailto:${COMPANY_EMAIL}" style="color: #f97316;">${COMPANY_EMAIL}</a></p>
  `;
  return getEmailTemplate(content, `Auto-renewal failed — ${APP_NAME}`, 'payment');
};

export default {
  getOTPEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
  getRegistrationSuccessEmailTemplate,
  getOnboardingSuccessEmailTemplate,
  getQRCodeReadyEmailTemplate,
  getPaymentSuccessEmailTemplate,
  getPaymentFailedEmailTemplate,
  getPaymentPendingEmailTemplate,
  getReviewReceivedEmailTemplate,
  getPaymentReminderEmailTemplate,
  getAutopayFailedEmailTemplate,
};
