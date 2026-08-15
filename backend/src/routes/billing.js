// backend/src/routes/billing.js
const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { startPlanCheckout, refreshPayment } = require('../lib/billing');

const router = express.Router();

async function getOwnCompanyOrFail(userId) {
  const company = await prisma.operatorCompany.findUnique({ where: { ownerId: userId } });
  if (!company) {
    const err = new Error('No company registered yet');
    err.status = 404;
    throw err;
  }
  return company;
}

// GET /api/billing/invoices — operator's own invoices
router.get('/invoices', requireAuth, async (req, res, next) => {
  try {
    const company = await getOwnCompanyOrFail(req.user.id);
    const invoices = await prisma.invoice.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (err) {
    next(err);
  }
});

// GET /api/billing/payments — operator's own payments
router.get('/payments', requireAuth, async (req, res, next) => {
  try {
    const company = await getOwnCompanyOrFail(req.user.id);
    const payments = await prisma.payment.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

// GET /api/billing/reminders — operator's own payment reminders
router.get('/reminders', requireAuth, async (req, res, next) => {
  try {
    const company = await getOwnCompanyOrFail(req.user.id);
    const reminders = await prisma.paymentReminder.findMany({
      where: { companyId: company.id },
      orderBy: { dueAt: 'desc' },
      take: 20,
    });
    res.json(reminders);
  } catch (err) {
    next(err);
  }
});

// POST /api/billing/checkout — start a subscription payment (M-Pesa or card)
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { planId, cycle, method, phone, origin } = req.body;
    if (!planId || !cycle || !method || !origin) {
      return res.status(400).json({ error: 'planId, cycle, method and origin are required' });
    }

    // Server-side guard: block "buying" the plan you're already on.
    // (The frontend already hides this option, but don't rely on that alone.)
    const company = await prisma.operatorCompany.findUnique({
      where: { ownerId: req.user.id },
      include: { subscription: true },
    });
    if (company?.subscription?.planId === planId && company.subscription.status === 'active') {
      return res.status(400).json({ error: 'You are already subscribed to this plan. Choose a different plan to upgrade.' });
    }

    const result = await startPlanCheckout(req.user.id, req.user.email, {
      planId, cycle, method, phone, origin,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/billing/refresh — re-check a pending payment against IntaSend
router.post('/refresh', requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId is required' });
    const result = await refreshPayment(req.user.id, paymentId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;