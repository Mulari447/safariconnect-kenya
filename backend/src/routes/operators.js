// backend/src/routes/operators.js
const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const companySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  county: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  licenseNumber: z.string().optional(),
  businessRegNumber: z.string().optional(),
  kraPin: z.string().optional(),
  katoMembership: z.string().optional(),
  physicalAddress: z.string().optional(),
  mapsUrl: z.string().optional(),
  contactPerson: z.string().optional(),
  whatsapp: z.string().optional(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  yearsInBusiness: z.number().int().optional(),
  employees: z.number().int().optional(),
  languages: z.array(z.string()).optional(),
  vehicleTypes: z.array(z.string()).optional(),
  safariSpecialties: z.array(z.string()).optional(),
  tourCategories: z.array(z.string()).optional(),
});

// GET /api/operators/directory — public list of verified/approved operators
router.get('/directory', async (req, res, next) => {
  try {
    const { county } = req.query;
    const companies = await prisma.operatorCompany.findMany({
      where: {
        verified: true,
        ...(county ? { county: String(county) } : {}),
      },
      select: {
        id: true, name: true, slug: true, description: true, county: true,
        website: true, logoUrl: true, verified: true, createdAt: true,
        subscription: { select: { plan: { select: { name: true, premiumBadge: true, featuredListing: true, priorityRank: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

// GET /api/operators/directory/:slug — public single company page
router.get('/directory/:slug', async (req, res, next) => {
  try {
    const company = await prisma.operatorCompany.findFirst({
      where: { slug: req.params.slug, verified: true },
    });
    if (!company) return res.status(404).json({ error: 'Operator not found' });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// --- IMPORTANT: /admin routes must come BEFORE /:something wildcard-like routes ---
// (none of those exist here currently, but keeping /admin high up avoids future collisions)

// GET /api/operators/admin?status=pending|approved|rejected — admin lists companies (defaults to all)
router.get('/admin', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const companies = await prisma.operatorCompany.findMany({
      where: status ? { status: String(status) } : {},
      orderBy: { createdAt: 'asc' },
    });
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

// Kept for backward compatibility — same as /admin?status=pending
router.get('/admin/pending', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const companies = await prisma.operatorCompany.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/operators/admin/:id/approve — admin approves an operator
router.patch('/admin/:id/approve', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { adminNote } = req.body;
    const company = await prisma.operatorCompany.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        verified: true,
        adminNote: adminNote ?? null,
        reviewedAt: new Date(),
      },
    });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/operators/admin/:id/reject — admin rejects an operator
router.patch('/admin/:id/reject', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { adminNote } = req.body;
    const company = await prisma.operatorCompany.update({
      where: { id: req.params.id },
      data: { status: 'rejected', verified: false, adminNote, reviewedAt: new Date() },
    });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// POST /api/operators — register a company (user becomes its owner + gets 'operator' role)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = companySchema.parse(req.body);

    const existing = await prisma.operatorCompany.findUnique({ where: { ownerId: req.user.id } });
    if (existing) {
      return res.status(409).json({ error: 'You already have a registered company' });
    }

    let slug = slugify(data.name);
    let suffix = 0;
    while (await prisma.operatorCompany.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${slugify(data.name)}-${suffix}`;
    }

    const company = await prisma.$transaction(async (tx) => {
      const created = await tx.operatorCompany.create({
        data: {
          ownerId: req.user.id,
          name: data.name,
          slug,
          description: data.description,
          county: data.county,
          phone: data.phone,
          email: data.email,
          website: data.website,
          licenseNumber: data.licenseNumber,
          businessRegNumber: data.businessRegNumber,
          kraPin: data.kraPin,
          katoMembership: data.katoMembership,
          physicalAddress: data.physicalAddress,
          mapsUrl: data.mapsUrl,
          contactPerson: data.contactPerson,
          whatsapp: data.whatsapp,
          logoUrl: data.logoUrl,
          coverImageUrl: data.coverImageUrl,
          yearsInBusiness: data.yearsInBusiness,
          employees: data.employees,
          languages: data.languages ?? [],
          vehicleTypes: data.vehicleTypes ?? [],
          safariSpecialties: data.safariSpecialties ?? [],
          tourCategories: data.tourCategories ?? [],
          status: 'pending',
        },
      });

      // Self-assign the operator role, same as the old Supabase policy allowed
      await tx.userRole.upsert({
        where: { userId_role: { userId: req.user.id, role: 'operator' } },
        update: {},
        create: { userId: req.user.id, role: 'operator' },
      });

      return created;
    });

    res.status(201).json(company);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
});

// GET /api/operators/me — the logged-in operator's own company
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const company = await prisma.operatorCompany.findUnique({
      where: { ownerId: req.user.id },
      include: { subscription: { include: { plan: true } } },
    });
    if (!company) return res.status(404).json({ error: 'No company registered yet' });
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/operators/me — update own company profile
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const company = await prisma.operatorCompany.findUnique({ where: { ownerId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'No company registered yet' });

    const data = companySchema.partial().parse(req.body);

    const updated = await prisma.operatorCompany.update({
      where: { id: company.id },
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

module.exports = router;