// backend/src/routes/leads.js
const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/leads — operator sends a priced offer on an open trip request
router.post('/', requireAuth, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('operator')) {
      return res.status(403).json({ error: 'Operator role required' });
    }

    const { tripRequestId, message, offerAmountKes, packageDetails, offerValidUntil } = req.body;
    if (!tripRequestId) {
      return res.status(400).json({ error: 'tripRequestId is required' });
    }
    if (offerAmountKes == null || Number(offerAmountKes) <= 0) {
      return res.status(400).json({ error: 'A valid offer amount (KES) is required' });
    }
    if (!packageDetails || !packageDetails.trim()) {
      return res.status(400).json({ error: 'Package details are required' });
    }

    const company = await prisma.operatorCompany.findUnique({
      where: { ownerId: req.user.id },
      include: { subscription: { include: { plan: true } } },
    });
    if (!company) {
      return res.status(404).json({ error: 'No company registered yet' });
    }
    if (company.status !== 'approved') {
      return res.status(403).json({ error: 'Your company must be approved before you can send offers.' });
    }

    // --- Enforce the monthly lead quota from the operator's plan ---
    const plan = company.subscription?.plan;
    if (!plan) {
      return res.status(403).json({ error: 'Subscribe to a plan before sending offers.' });
    }
    if (plan.leadLimitMonthly != null) {
      const periodStart = company.subscription?.currentPeriodStart ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const usedThisPeriod = await prisma.leadRequest.count({
        where: { companyId: company.id, createdAt: { gte: periodStart } },
      });
      if (usedThisPeriod >= plan.leadLimitMonthly) {
        return res.status(403).json({
          error: `You've used all ${plan.leadLimitMonthly} leads on your ${plan.name} plan this period. Upgrade your plan to send more offers.`,
        });
      }
    }

    const tripRequest = await prisma.tripRequest.findUnique({ where: { id: tripRequestId } });
    if (!tripRequest || tripRequest.status !== 'open') {
      return res.status(404).json({ error: 'Trip request not found or no longer open' });
    }

    const lead = await prisma.leadRequest.create({
      data: {
        tripRequestId,
        companyId: company.id,
        travellerId: tripRequest.userId,
        message: message ?? null,
        offerAmountKes: Number(offerAmountKes),
        packageDetails: packageDetails.trim(),
        offerValidUntil: offerValidUntil ? new Date(offerValidUntil) : null,
        status: 'pending',
      },
    });

    res.status(201).json(lead);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'You already sent a lead request for this trip' });
    }
    next(err);
  }
});

// GET /api/leads/mine — operator's own sent lead requests.
// Traveller contact is only included once the offer has been accepted.
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const company = await prisma.operatorCompany.findUnique({ where: { ownerId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'No company registered yet' });

    const leads = await prisma.leadRequest.findMany({
      where: { companyId: company.id },
      include: {
        tripRequest: true,
        traveller: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const shaped = leads.map((lead) => {
      const { traveller, ...rest } = lead;
      return {
        ...rest,
        travellerContact:
          lead.status === 'accepted'
            ? {
                email: traveller.email,
                fullName: traveller.profile?.fullName ?? null,
                phone: traveller.profile?.phone ?? null,
              }
            : null,
      };
    });

    res.json(shaped);
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/received — traveller's lead requests on their trips
router.get('/received', requireAuth, async (req, res, next) => {
  try {
    const leads = await prisma.leadRequest.findMany({
      where: { travellerId: req.user.id },
      include: {
        company: { select: { id: true, name: true, slug: true, logoUrl: true, phone: true, whatsapp: true, email: true } },
        tripRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/leads/:id — traveller accepts or declines a lead request
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' | 'declined'
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: "status must be 'accepted' or 'declined'" });
    }

    const lead = await prisma.leadRequest.findUnique({ where: { id: req.params.id } });
    if (!lead) return res.status(404).json({ error: 'Not found' });
    if (lead.travellerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.leadRequest.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;