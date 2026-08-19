const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const tripRequestSchema = z.object({
  destinationSlug: z.string().optional().nullable(),
  destinationName: z.string().min(1, { message: "Destination name is required" }),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  flexibleDates: z.boolean().optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  budget: z.number().optional().nullable(),
  budgetCurrency: z.string().optional().nullable(),
  budgetUsd: z.number().optional().nullable(),
  accommodationType: z.string().optional().nullable(),
  transportPreference: z.string().optional().nullable(),
  luxuryLevel: z.string().optional().nullable(),
  activities: z.array(z.string()).optional(),
  nationality: z.string().optional().nullable(),
  arrivalAirport: z.string().optional().nullable(),
  pickupLocation: z.string().optional().nullable(),
  dietaryRequirements: z.string().optional().nullable(),
  specialNeeds: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const cleanEmptyStrings = (obj) => {
  const cleaned = {};
  for (const [key, val] of Object.entries(obj)) {
    cleaned[key] = val === "" ? undefined : val;
  }
  return cleaned;
};

// 1. GET /mine — Fetch traveller's own trip requests
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const tripRequests = await prisma.tripRequest.findMany({
      where: { userId: req.user.id },
      include: {
        leadRequests: {
          include: {
            company: {
              select: { id: true, name: true, county: true, website: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tripRequests);
  } catch (err) {
    next(err);
  }
});

// 2. POST / — Create a new trip request
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const rawData = cleanEmptyStrings(req.body);
    const data = tripRequestSchema.parse(rawData);

    const tripRequest = await prisma.tripRequest.create({
      data: {
        userId: req.user.id,
        destinationSlug: data.destinationSlug || undefined,
        destinationName: data.destinationName,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        flexibleDates: data.flexibleDates ?? false,
        adults: data.adults ?? 2,
        children: data.children ?? 0,
        budget: data.budget ? Number(data.budget) : undefined,
        budgetCurrency: data.budgetCurrency || 'USD',
        budgetUsd: data.budgetUsd ? Number(data.budgetUsd) : undefined,
        accommodationType: data.accommodationType || undefined,
        transportPreference: data.transportPreference || undefined,
        luxuryLevel: data.luxuryLevel || undefined,
        activities: data.activities ?? [],
        nationality: data.nationality || undefined,
        arrivalAirport: data.arrivalAirport || undefined,
        pickupLocation: data.pickupLocation || undefined,
        dietaryRequirements: data.dietaryRequirements || undefined,
        specialNeeds: data.specialNeeds || undefined,
        notes: data.notes || undefined,
        status: 'open',
        quotesCount: 0,
      },
    });

    res.status(201).json(tripRequest);
  } catch (err) {
    if (err instanceof z.ZodError || err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// 3. GET /open — Fetch open trip requests for operators
router.get('/open', requireAuth, async (req, res, next) => {
  try {
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('operator') && req.user.role !== 'operator') {
      return res.status(403).json({ error: 'Operator role required' });
    }
    const company = await prisma.operatorCompany.findUnique({ where: { ownerId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'No company registered yet' });

    const tripRequests = await prisma.tripRequest.findMany({ 
      where: { status: 'open' }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(tripRequests.slice(0, 100));
  } catch (err) {
    next(err);
  }
});

// 4. POST /:id/quotes — Operator submits an offer (Enforces Priority Window & Max 2 Capped Offers)
router.post('/:id/quotes', requireAuth, async (req, res, next) => {
  try {
    const userRoles = req.user.roles || [];
    const isOperator = userRoles.includes('operator') || req.user.role === 'operator';
    if (!isOperator) {
      return res.status(403).json({ error: 'Operator role required to submit offers.' });
    }

    const { id: tripRequestId } = req.params;
    const offerPayload = req.body; // { message, offerAmountKes, packageDetails, offerValidUntil }

    // Fetch operator company & subscription details
    const company = await prisma.operatorCompany.findUnique({
      where: { ownerId: req.user.id },
      include: { 
        subscription: { 
          include: { plan: true } 
        } 
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Operator company profile not found.' });
    }

    if (company.status !== 'approved' || !company.verified) {
      return res.status(403).json({ error: 'Your operator account must be approved and verified by admin before submitting offers.' });
    }

    // Fetch the Trip Request
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: tripRequestId },
      include: { leadRequests: true }
    });

    if (!tripRequest) {
      return res.status(404).json({ error: 'Trip request not found.' });
    }

    // --- RULE A: CAPPED DISTRIBUTION (Max 2 Offers Total) ---
    if (tripRequest.quotesCount >= 2 || tripRequest.status === 'closed') {
      return res.status(400).json({ error: 'This trip request has already reached its maximum limit of 2 offers and is now closed.' });
    }

    // Check if this specific operator already submitted an offer
    const alreadySubmitted = tripRequest.leadRequests.some(lr => lr.companyId === company.id);
    if (alreadySubmitted) {
      return res.status(400).json({ error: 'You have already submitted an offer for this trip request.' });
    }

    // --- RULE B: PRIORITY WINDOW (e.g., First 6 hours reserved for priority/gold operators) ---
    const hoursSinceCreated = (Date.now() - new Date(tripRequest.createdAt).getTime()) / (1000 * 60 * 60);
    const PRIORITY_WINDOW_HOURS = 6;
    const priorityRank = company.subscription?.plan?.priorityRank || 0;

    if (hoursSinceCreated < PRIORITY_WINDOW_HOURS && priorityRank === 0) {
      const hoursRemaining = Math.ceil(PRIORITY_WINDOW_HOURS - hoursSinceCreated);
      return res.status(403).json({
        error: `This lead is currently in its exclusive priority window for top-tier operators. It opens for standard operators in about ${hoursRemaining} hour(s).`
      });
    }

    // TRANSACTION: Create offer/lead request and increment quotesCount safely
    const [newLead, updatedRequest] = await prisma.$transaction(async (tx) => {
      const lead = await tx.leadRequest.create({
        data: {
          tripRequestId,
          companyId: company.id,
          travellerId: tripRequest.userId,
          message: offerPayload.message || null,
          offerAmountKes: offerPayload.offerAmountKes ? Number(offerPayload.offerAmountKes) : null,
          packageDetails: offerPayload.packageDetails || null,
          offerValidUntil: offerPayload.offerValidUntil ? new Date(offerPayload.offerValidUntil) : null,
          status: 'pending',
        }
      });

      const newCount = tripRequest.quotesCount + 1;
      const updatedReq = await tx.tripRequest.update({
        where: { id: tripRequestId },
        data: {
          quotesCount: newCount,
          status: newCount >= 2 ? 'closed' : 'open' // Automatically close request once 2 offers are reached!
        }
      });

      return [lead, updatedReq];
    });

    res.status(201).json({
      message: 'Offer submitted successfully!',
      lead: newLead,
      slotsRemaining: 2 - updatedRequest.quotesCount,
      requestStatus: updatedRequest.status,
    });

  } catch (err) {
    next(err);
  }
});

// 5. GET /:id — Get a specific trip request
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: req.params.id },
      include: { leadRequests: { include: { company: { select: { id: true, name: true, county: true, website: true } } } } }
    });
    if (!tripRequest) return res.status(404).json({ error: 'Not found' });
    res.json(tripRequest);
  } catch (err) {
    next(err);
  }
});

// 6. PATCH /:id — Update trip request status or notes
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.tripRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { status, notes } = req.body;
    const updated = await prisma.tripRequest.update({
      where: { id: req.params.id },
      data: { ...(status ? { status } : {}), ...(notes !== undefined ? { notes } : {}) },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;