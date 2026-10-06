// backend/src/routes/auth.js
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../lib/mailer');

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).optional(),
  role: z.enum(['customer', 'operator']).optional().default('customer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user, roles) {
  return jwt.sign(
    { sub: user.id, email: user.email, roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, role } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Explicitly normalize and validate the assigned role
    const assignedRole = role === 'operator' ? 'operator' : 'customer';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerified: false,
        verificationToken,
        verificationExpires,
        intendedRole: assignedRole,
        profile: { create: { fullName: fullName || null } },
        roles: { 
          create: { 
            role: assignedRole 
          } 
        },
      },
      include: { roles: true },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail(user.email, verifyUrl);
    } catch (mailErr) {
      console.error('Failed to send verification email:', mailErr.message);
    }

    res.status(201).json({
      message: 'Account created. Please check your email to verify your account before logging in.',
      email: user.email,
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // --- SUSPENSION CHECK ---
    if (user.suspended) {
      // Check if temporary suspension has expired
      if (user.suspendedUntil && new Date() > new Date(user.suspendedUntil)) {
        // Auto-lift expired temporary suspension
        await prisma.user.update({
          where: { id: user.id },
          data: { suspended: false, suspendedUntil: null },
        });
      } else {
        // Block login and display reason
        const message = user.suspendedUntil 
          ? `Account suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}` 
          : 'Your account has been permanently suspended.';
        return res.status(403).json({ error: message });
      }
    }
    // ------------------------

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox for the verification link.' });
    }

    const roles = user.roles.map((r) => r.role);
    const token = signToken(user, roles);

    res.json({
      token,
      user: { id: user.id, email: user.email, roles },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing verification token' });

    const user = await prisma.user.findUnique({ 
      where: { verificationToken: token },
      include: { roles: true }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or already-used verification link' });
    }
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return res.status(400).json({ error: 'This verification link has expired. Please request a new one.' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null, verificationExpires: null },
      include: { roles: true },
    });

    const roles = updated.roles.map((r) => r.role);
    const jwtToken = signToken(updated, roles);

    res.json({
      message: 'Email verified successfully.',
      token: jwtToken,
      user: { id: updated.id, email: updated.email, roles },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) {
      return res.json({ message: 'If an unverified account exists for that email, a new link has been sent.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationExpires },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, verifyUrl);

    res.json({ message: 'If an unverified account exists for that email, a new link has been sent.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true, roles: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      profile: user.profile,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.json({ message: 'If that email exists in our system, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        resetPasswordToken: resetToken, 
        resetPasswordExpires: resetExpires 
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ message: 'If that email exists in our system, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const user = await prisma.user.findUnique({ 
      where: { resetPasswordToken: token } 
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash, 
        resetPasswordToken: null, 
        resetPasswordExpires: null 
      },
    });

    res.json({ message: 'Password has been successfully reset.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;