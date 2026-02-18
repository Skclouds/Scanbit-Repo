/**
 * Shared email service for ScanBit — single transporter, send helpers.
 * Uses SMTP from env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 */
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { getQRCodeReadyEmailTemplate } from './emailTemplates.js';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send an email. Returns { sent: true } or throws / returns { sent: false, error }.
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} html - HTML body
 * @param {Array<{ filename: string, content: Buffer }>} [attachments] - Optional attachments
 */
export async function sendEmail(to, subject, html, attachments = []) {
  if (!to || !subject || !html) {
    throw new Error('sendEmail: to, subject, and html are required');
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'ScanBit <noreply@scanbit.in>';
  const transporter = createTransporter();
  const hasAuth = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
  if (!hasAuth) {
    return { sent: false, skipped: true };
  }
  try {
    await transporter.sendMail({
      from,
      to: to.trim().toLowerCase(),
      subject,
      html,
      attachments: attachments.length ? attachments : undefined,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err?.message || String(err) };
  }
}

/**
 * Generate QR code as PNG buffer for a URL.
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
export async function generateQRBuffer(url) {
  if (!url) return null;
  try {
    return await QRCode.toBuffer(url, { type: 'png', width: 280, margin: 2 });
  } catch (err) {
    return null;
  }
}

/**
 * Send "Your QR code is ready" email with QR image attached (cid:qrcode).
 * @param {string} to - Owner email
 * @param {string} businessName
 * @param {string} [businessType]
 * @param {string} [businessCategory]
 * @param {string} menuUrl - Full menu/portfolio URL
 */
export async function sendQRCodeReadyEmail(to, businessName, businessType, businessCategory, menuUrl) {
  const buffer = await generateQRBuffer(menuUrl);
  const html = getQRCodeReadyEmailTemplate(businessName, businessType, businessCategory, menuUrl, !!buffer);
  const attachments = buffer ? [{ filename: 'qrcode.png', content: buffer, cid: 'qrcode' }] : [];
  return sendEmail(to, 'Your QR code is ready — ScanBit', html, attachments);
}

export default { sendEmail, createTransporter, generateQRBuffer, sendQRCodeReadyEmail };
