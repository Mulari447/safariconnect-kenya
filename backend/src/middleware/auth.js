// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in .env');
}

async function requireAuth(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.cookies && req.cookies.sck_token) {
      token = req.cookies.sck_token;
    }

    if (!token) {
      console.log('[Auth Middleware] Rejected: No token provided in headers or cookies.');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.userId || decoded.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      console.log('[Auth Middleware] Rejected: User ID in token does not exist in DB:', userId);
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      role: user.roles[0]?.role || 'user',
    };

    next();
  } catch (err) {
    console.log('[Auth Middleware] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || (!req.user.roles.includes(role) && req.user.role !== role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };