const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

// GET /api/admin/overview — fetch all platform stats, plans, and records
router.get('/overview', async (req, res, next) => {
  try {
    const [users, operators, tripRequests, plans, offers] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, email: true, roles: true, suspended: true, suspendedUntil: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.operatorCompany.findMany({
        include: { owner: { select: { email: true, suspended: true, suspendedUntil: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tripRequest.findMany({
        include: {
          user: { select: { email: true } },
          leadRequests: {
            include: {
              company: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.subscriptionPlan ? prisma.subscriptionPlan.findMany({
        orderBy: { sortOrder: 'asc' }
      }).catch(() => []) : Promise.resolve([]),
      prisma.offer ? prisma.offer.findMany({
        include: { operator: { select: { name: true } }, tripRequest: { select: { destinationName: true } } },
        orderBy: { createdAt: 'desc' }
      }).catch(() => []) : Promise.resolve([])
    ]);

    const formattedTripRequests = tripRequests.map(tr => ({
      ...tr,
      offers: (tr.leadRequests || []).map(lr => ({
        ...lr,
        operator: lr.company
      }))
    }));

    res.json({ users, operators, tripRequests: formattedTripRequests, plans: plans || [], offers });
  } catch (err) {
    console.error("CRITICAL ADMIN ROUTE ERROR:", err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PATCH /api/admin/operators/:id/verify — Approve or modify operator account status
router.patch('/operators/:id/verify', async (req, res, next) => {
  try {
    const { verified, status, adminNote } = req.body;
    
    const updateData = {};
    
    if (verified !== undefined) {
      updateData.verified = Boolean(verified);
      updateData.status = Boolean(verified) ? 'approved' : 'pending';
    }
    
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'approved') {
        updateData.verified = true;
      }
    }

    if (adminNote !== undefined) {
      updateData.adminNote = adminNote;
    }

    updateData.reviewedAt = new Date();

    const updated = await prisma.operatorCompany.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(updated);
  } catch (err) {
    console.error("CRITICAL OPERATOR UPDATE ERROR:", err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PATCH /api/admin/users/:id/suspend — Suspend (temporary or permanent) or lift suspension for any user/operator
router.patch('/users/:id/suspend', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { suspensionType, durationDays } = req.body; 
    // suspensionType options: 'temporary', 'permanent', or 'lift'

    let suspended = true;
    let suspendedUntil = null;

    if (suspensionType === 'lift') {
      suspended = false;
      suspendedUntil = null;
    } else if (suspensionType === 'temporary' && durationDays) {
      // Calculate exact expiration date based on input days
      suspendedUntil = new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000);
    } else {
      // Permanent suspension (no expiration date)
      suspendedUntil = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        suspended,
        suspendedUntil,
      },
      include: { profile: true, roles: true, operatorCompany: true },
    });

    const actionText = 
      suspensionType === 'lift' 
        ? 'Suspension lifted successfully.' 
        : suspensionType === 'temporary' 
        ? `User suspended temporarily for ${durationDays} days.` 
        : 'User permanently suspended.';

    res.json({
      message: actionText,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        suspended: updatedUser.suspended,
        suspendedUntil: updatedUser.suspendedUntil,
      },
    });
  } catch (err) {
    console.error("CRITICAL USER SUSPENSION ERROR:", err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PUT /api/admin/plans/:id — Update subscription tier / plan settings
router.put('/plans/:id', async (req, res, next) => {
  try {
    const data = req.body;
    
    if (!prisma.subscriptionPlan) {
      return res.status(400).json({ error: 'SubscriptionPlan model not initialized in Prisma schema' });
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priceKes !== undefined) updateData.priceKes = parseFloat(data.priceKes);
    if (data.priceKesAnnual !== undefined) updateData.priceKesAnnual = parseFloat(data.priceKesAnnual);
    if (data.priorityRank !== undefined) updateData.priorityRank = parseInt(data.priorityRank, 10);
    if (data.staffAccounts !== undefined) updateData.staffAccounts = parseInt(data.staffAccounts, 10);
    if (data.premiumBadge !== undefined) updateData.premiumBadge = Boolean(data.premiumBadge);
    if (data.featuredListing !== undefined) updateData.featuredListing = Boolean(data.featuredListing);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(updatedPlan);
  } catch (err) {
    console.error("CRITICAL PLAN UPDATE ERROR:", err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// DELETE /api/admin/trip-requests/:id — delete spam or test trip requests
router.delete('/trip-requests/:id', async (req, res, next) => {
  try {
    await prisma.tripRequest.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("CRITICAL TRIP DELETE ERROR:", err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;