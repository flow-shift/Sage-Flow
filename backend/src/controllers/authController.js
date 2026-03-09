import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UAParser from 'ua-parser-js';
import { db } from '../config/db.js';
import { sendVerificationEmail, sendDeviceVerificationEmail, sendPasswordResetEmail } from '../config/email.js';

const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  return {
    device: `${result.device.vendor || 'Unknown'} ${result.device.model || 'Device'}`,
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    ip: req.ip || req.connection.remoteAddress
  };
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await db.query(
      'INSERT INTO users (name, email, password, verification_token, verified) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hashedPassword, verificationToken, false]
    );

    await sendVerificationEmail(email, verificationToken);

    res.json({ message: 'Signup successful. Please check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // if (!user.verified) return res.status(403).json({ error: 'Please verify your email first' });

    const deviceInfo = getDeviceInfo(req);
    const deviceResult = await db.query(
      'SELECT * FROM devices WHERE user_id = $1 AND browser = $2 AND os = $3',
      [user.id, deviceInfo.browser, deviceInfo.os]
    );
    const deviceCheck = deviceResult.rows[0];

    if (!deviceCheck) {
      const deviceToken = crypto.randomBytes(32).toString('hex');
      await db.query(
        'INSERT INTO devices (user_id, device_name, browser, os, ip_address, verification_token, verified) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.id, deviceInfo.device, deviceInfo.browser, deviceInfo.os, deviceInfo.ip, deviceToken, false]
      );
      await sendDeviceVerificationEmail(user.email, deviceInfo, deviceToken);
      return res.json({ message: 'New device detected. Please check your email to verify this device.' });
    }

    if (!deviceCheck.verified) {
      return res.status(403).json({ error: 'Please verify this device first. Check your email.' });
    }

    await db.query('UPDATE devices SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [deviceCheck.id]);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const result = await db.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid token' });

    await db.query('UPDATE users SET verified = $1, verification_token = NULL WHERE verification_token = $2', [true, token]);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyDevice = async (req, res) => {
  try {
    const { token } = req.query;

    const result = await db.query('SELECT * FROM devices WHERE verification_token = $1', [token]);
    const device = result.rows[0];
    if (!device) return res.status(400).json({ error: 'Invalid token' });

    await db.query('UPDATE devices SET verified = $1, verification_token = NULL WHERE verification_token = $2', [true, token]);

    res.json({ message: 'Device verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  const user = req.user;
  const deviceInfo = getDeviceInfo(req);
  
  const deviceResult = await db.query(
    'SELECT * FROM devices WHERE user_id = $1 AND browser = $2 AND os = $3',
    [user.id, deviceInfo.browser, deviceInfo.os]
  );
  const deviceCheck = deviceResult.rows[0];

  if (!deviceCheck) {
    const deviceToken = crypto.randomBytes(32).toString('hex');
    await db.query(
      'INSERT INTO devices (user_id, device_name, browser, os, ip_address, verification_token, verified) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [user.id, deviceInfo.device, deviceInfo.browser, deviceInfo.os, deviceInfo.ip, deviceToken, false]
    );
    await sendDeviceVerificationEmail(user.email, deviceInfo, deviceToken);
  } else if (deviceCheck.verified) {
    await db.query('UPDATE devices SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [deviceCheck.id]);
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.json({ message: 'If email exists, reset link sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);

    await db.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3',
      [resetToken, resetExpires, email]
    );

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'If email exists, reset link sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    );
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
