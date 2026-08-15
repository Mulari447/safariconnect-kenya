// backend/src/routes/tripRequests.js
const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const tripRequestSchema = z.object({
  destinationSlug: z.string().optional(),
  destinationName: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  flexibleDates: z.boolean().optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  budgetUsd: z.number().optional(),
  accommodationType: z.string().optional(),
  transportPreference: z.string().optional(),
  luxuryLevel: z.string().optional(),
  activities: z.array(z.string()).optional(),
  nationality: z.string().optional(),
  arrivalAirport: z.string().optional(),
  pickupLocation: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  specialNeeds: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/trip-requests — traveller creates a trip request
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = tripRequestSchema.parse(req.body);

    const tripRequest = await prisma.tripRequest.create({
      data: {
        userId: req.user.id,
        destinationSlug: data.destinationSlug,
        destinationName: data.destinationName,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        flexibleDates: data.flexibleDates ?? false,
        adults: data.adults ?? 2,
        children: data.children ?? 0,
        budgetUsd: data.budgetUsd,
        accommodationType: data.accommodationType,
        transportPreference: data.transportPreference,
        luxuryLevel: data.luxuryLevel,
        activities: data.activities ?? [],
        nationality: data.nationality,
        arrivalAirport: data.arrivalAirport,
        pickupLocation: data.pickupLocation,
        dietaryRequirements: data.dietaryRequirements,
        specialNeeds: data.specialNeeds,
        notes: data.notes,
      },
    });

    res.status(201).json(tripRequest);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// GET /api/trip-requests/mine — traveller's own trip requests
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const tripRequests = await prisma.tripRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tripRequests);
  } catch (err) {
    next(err);
  }
});

// GET /api/trip-requests/open — operators browse open leads, filtered to
// what actually fits their company (county + tour category/specialty match)
router.get('/open', requireAuth, async (req, res, next) => {
  try {
    if (!req.user.roles.includes('operator')) {
      return res.status(403).json({ error: 'Operator role required' });
    }

    const company = await prisma.operatorCompany.findUnique({ where: { ownerId: req.user.id } });
    if (!company) {
      return res.status(404).json({ error: 'No company registered yet' });
    }

    const tripRequests = await prisma.tripRequest.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
    });

    // Pull county/category for each referenced destination in one batch query
    const slugs = [...new Set(tripRequests.map((t) => t.destinationSlug).filter(Boolean))];
    const destinations = slugs.length
      ? await prisma.destination.findMany({
          where: { slug: { in: slugs } },
          select: { slug: true, county: true, category: true },
        })
      : [];
    const destBySlug = new Map(destinations.map((d) => [d.slug, d]));

    const companyTags = [...(company.tourCategories ?? []), ...(company.safariSpecialties ?? [])].map((t) =>
      t.toLowerCase(),
    );

    const eligible = tripRequests.filter((t) => {
      const dest = t.destinationSlug ? destBySlug.get(t.destinationSlug) : null;

      // County match: if the operator declared a county and the trip's
      // destination has one, they must match. No county set on either side
      // means "no restriction" (operator serves anywhere / trip has no fixed destination).
      const countyOk = !company.county || !dest?.county || company.county === dest.county;

      // Category/specialty match: if the operator declared any tags, at
      // least one must overlap with the trip's activities or the destination's
      // category. Operators who haven't filled this in yet see everything.
      const tripTags = [...(t.activities ?? []), dest?.category ?? ''].map((s) => s.toLowerCase());
      const categoryOk = companyTags.length === 0 || companyTags.some((tag) => tripTags.includes(tag));

      return countyOk && categoryOk;
    });

    res.json(eligible.slice(0, 100));
  } catch (err) {
    next(err);
  }
});

// GET /api/trip-requests/:id — single trip request (owner only)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!tripRequest) return res.status(404).json({ error: 'Not found' });
    if (tripRequest.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(tripRequest);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/trip-requests/:id — traveller updates/cancels their own request
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.tripRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { status, notes } = req.body;

    const updated = await prisma.tripRequest.update({
      where: { id: req.params.id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;