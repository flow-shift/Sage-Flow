import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'https://sage-flow-gamma.vercel.app'}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: `"Sage Flow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Sage Flow Account',
    html: `
      <h2>Welcome to Sage Flow!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>Or copy this link: ${verifyUrl}</p>
    `
  });
};

export const sendDeviceVerificationEmail = async (email, deviceInfo, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'https://sage-flow-gamma.vercel.app'}/verify-device?token=${token}`;
  
  await transporter.sendMail({
    from: `"Sage Flow Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'New Device Login - Sage Flow',
    html: `
      <h2>New Device Login Detected</h2>
      <p>A login was detected from a new device:</p>
      <ul>
        <li>Device: ${deviceInfo.device}</li>
        <li>Browser: ${deviceInfo.browser}</li>
        <li>OS: ${deviceInfo.os}</li>
        <li>IP: ${deviceInfo.ip}</li>
      </ul>
      <p>Click below to verify this device:</p>
      <a href="${verifyUrl}">Verify Device</a>
      <p>Or copy this link: ${verifyUrl}</p>
    `
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://sage-flow-gamma.vercel.app'}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: `"Sage Flow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Sage Flow',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `
  });
};
