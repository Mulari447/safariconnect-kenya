// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const destinationsRoutes = require('./routes/destinations');
const tripRequestsRoutes = require('./routes/tripRequests');
const operatorsRoutes = require('./routes/operators');
const leadsRoutes = require('./routes/leads');
const reviewsRoutes = require('./routes/reviews');
const plansRoutes = require('./routes/plans');
const billingRoutes = require('./routes/billing');
const webhooksRoutes = require('./routes/webhooks');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/trip-requests', tripRequestsRoutes);
app.use('/api/operators', operatorsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/webhooks', webhooksRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SafariConnect backend running on http://localhost:${PORT}`);
});