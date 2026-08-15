// backend/src/routes/reviews.js
const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const reviewSchema = z.object({
  destinationSlug: z.string().optional(),
  companyId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(1),
  photos: z.array(z.string()).max(6).optional(),
});

// GET /api/reviews — public list, filter by destination or company
router.get('/', async (req, res, next) => {
  try {
    const { destinationSlug, companyId } = req.query;

    const reviews = await prisma.review.findMany({
      where: {
        ...(destinationSlug ? { destinationSlug: String(destinationSlug) } : {}),
        ...(companyId ? { companyId: String(companyId) } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews — signed-in user writes a review
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = reviewSchema.parse(req.body);

    // "verified traveler" if they have a trip request matching this destination
    let verifiedTraveler = false;
    if (data.destinationSlug) {
      const match = await prisma.tripRequest.findFirst({
        where: { userId: req.user.id, destinationSlug: data.destinationSlug },
      });
      verifiedTraveler = !!match;
    } else {
      const anyTrip = await prisma.tripRequest.findFirst({ where: { userId: req.user.id } });
      verifiedTraveler = !!anyTrip;
    }

    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        destinationSlug: data.destinationSlug,
        companyId: data.companyId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        photos: data.photos ?? [],
        authorName: profile?.fullName || null,
        verifiedTraveler,
      },
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// PATCH /api/reviews/:id — author updates their own review
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const data = reviewSchema.partial().parse(req.body);

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updated);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// DELETE /api/reviews/:id — author deletes their own review
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.userId !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews/:id/vote — mark a review helpful (toggle)
router.post('/:id/vote', requireAuth, async (req, res, next) => {
  try {
    const existingVote = await prisma.reviewVote.findUnique({
      where: { reviewId_userId: { reviewId: req.params.id, userId: req.user.id } },
    });

    if (existingVote) {
      await prisma.reviewVote.delete({ where: { id: existingVote.id } });
    } else {
      await prisma.reviewVote.create({
        data: { reviewId: req.params.id, userId: req.user.id },
      });
    }

    const helpfulCount = await prisma.reviewVote.count({ where: { reviewId: req.params.id } });
    await prisma.review.update({ where: { id: req.params.id }, data: { helpfulCount } });

    res.json({ helpfulCount, voted: !existingVote });
  } catch (err) {
    next(err);
  }
});

module.exports = router;