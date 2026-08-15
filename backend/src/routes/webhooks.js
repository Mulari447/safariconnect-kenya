// backend/src/routes/webhooks.js
const express = require('express');
const prisma = require('../lib/prisma');
const { reconcilePayment } = require('../lib/billing');

const router = express.Router();

router.post('/intasend', async (req, res) => {
  const expected = process.env.INTASEND_WEBHOOK_CHALLENGE;
  const body = req.body || {};

  if (!expected || body.challenge !== expected) {
    return res.status(401).send('Invalid challenge');
  }

  const providerInvoiceId = String(body.invoice_id ?? '');
  const state = String(body.state ?? '');
  if (!providerInvoiceId) return res.status(400).send('Missing invoice_id');

  const safePayload = { ...body };
  delete safePayload.challenge;

  await prisma.paymentEvent.create({
    data: {
      provider: 'intasend',
      eventType: state || 'unknown',
      providerInvoiceId,
      payload: safePayload,
    },
  });

  await reconcilePayment({
    providerInvoiceId,
    state,
    mpesaReceipt: body.mpesa_reference ?? null,
    failureReason: body.failed_reason ?? null,
  });

  res.send('ok');
});

module.exports = router;