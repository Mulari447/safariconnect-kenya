// backend/src/routes/plans.js
const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const planSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  priceKes: z.number().optional(),
  priceKesAnnual: z.number().optional(),
  leadLimitMonthly: z.number().int().nullable().optional(),
  storageMb: z.number().int().optional(),
  crmAccess: z.boolean().optional(),
  reportsAccess: z.boolean().optional(),
  staffAccounts: z.number().int().optional(),
  packageLimit: z.number().int().nullable().optional(),
  priorityRank: z.number().int().optional(),
  premiumBadge: z.boolean().optional(),
  featuredListing: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/plans — public list of active plans
router.get('/', async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

// GET /api/plans/admin — admin sees all plans, including inactive
router.get('/admin', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

// POST /api/plans — admin creates a plan
router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const data = planSchema.parse(req.body);
    const plan = await prisma.subscriptionPlan.create({ data });
    res.status(201).json(plan);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// PATCH /api/plans/:id — admin updates a plan
router.patch('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const data = planSchema.partial().parse(req.body);
    const plan = await prisma.subscriptionPlan.update({
      where: { id: req.params.id },
      data,
    });
    res.json(plan);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// DELETE /api/plans/:id — admin deletes a plan
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    await prisma.subscriptionPlan.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;