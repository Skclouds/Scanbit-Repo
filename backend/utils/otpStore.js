// Shared OTP store for use across routes
// In production, replace with Redis or MongoDB

const otpStore = new Map(); // email -> { otp, expiresAt, attempts, verified }

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP
export const storeOTP = (email, otp, expiresInMinutes = 10) => {
  const emailLower = email.toLowerCase();
  otpStore.set(emailLower, {
    otp,
    expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
    attempts: 0,
    verified: false,
  });
};

// Get OTP data
export const getOTP = (email) => {
  return otpStore.get(email.toLowerCase());
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const emailLower = email.toLowerCase();
  const storedData = otpStore.get(emailLower);
  
  if (!storedData) return { valid: false, error: 'OTP not found' };
  
  // Check if expired
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(emailLower);
    return { valid: false, error: 'OTP expired' };
  }
  
  // Check attempts
  if (storedData.attempts >= 5) {
    otpStore.delete(emailLower);
    return { valid: false, error: 'Too many attempts' };
  }
  
  // Verify OTP
  if (storedData.otp !== otp) {
    storedData.attempts += 1;
    otpStore.set(emailLower, storedData);
    return { valid: false, error: 'Invalid OTP', attemptsRemaining: 5 - storedData.attempts };
  }
  
  // Mark as verified
  storedData.verified = true;
  storedData.verifiedAt = Date.now();
  otpStore.set(emailLower, storedData);
  
  return { valid: true, verified: true };
};

// Check if email is verified
export const isEmailVerified = (email) => {
  const emailLower = email.toLowerCase();
  const storedData = otpStore.get(emailLower);
  
  if (!storedData) return false;
  
  // Check if expired
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(emailLower);
    return false;
  }
  
  return storedData.verified === true;
};

// Delete OTP (after successful registration)
export const deleteOTP = (email) => {
  otpStore.delete(email.toLowerCase());
};

// Clean expired OTPs
export const cleanExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
};
