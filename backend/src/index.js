// backend/src/index.js
require('../loadEnv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const destinationsRoutes = require('./routes/destinations');
const tripRequestsRoutes = require('./routes/tripRequests');
const operatorsRoutes = require('./routes/operators');
const leadsRoutes = require('./routes/leads');
const reviewsRoutes = require('./routes/reviews');
const plansRoutes = require('./routes/plans');
const billingRoutes = require('./routes/billing');
const webhooksRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin'); // <-- Newly added admin routes

const app = express();

// Behind nginx / cPanel / Cloudflare reverse proxy
app.set('trust proxy', 1);

// 1. Set security HTTP headers immediately
app.use(helmet());

// 2. Global Rate Limiter (Prevents DDoS and basic flooding)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again later." },
});
app.use('/api/', globalLimiter);

// 3. Stricter Rate Limiter for Authentication (Prevents brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // Limit each IP to 15 auth attempts per 10 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later." },
});
app.use('/api/auth', authLimiter);

// 4. Rate Limiter for Trip Requests (Prevents bot spam / fake lead flooding)
const tripRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 trip quote requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You have submitted too many trip requests recently. Please try again later." },
});
app.use('/api/trip-requests', tripRequestLimiter);

// 5. Strict CORS setup supporting multiple trusted domains from environment variables
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/trip-requests', tripRequestsRoutes);
app.use('/api/operators', operatorsRoutes);
app.use('/api/operator', operatorsRoutes); // <-- Added alias so both /api/operators and /api/operator work seamlessly!
app.use('/api/leads', leadsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/admin', adminRoutes); // <-- Registered admin router endpoint

app.use((err, req, res, next) => {
  console.error(err);
  const debug = String(process.env.APP_DEBUG || '').toLowerCase() === 'true';
  const status = err.status || 500;
  res.status(status).json({
    error: debug || status < 500
      ? (err.message || 'Internal server error')
      : 'Internal server error',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SafariConnect backend running securely on http://localhost:${PORT}`);
});