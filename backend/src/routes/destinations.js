// backend/src/routes/destinations.js
const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /api/destinations — list all destinations (public)
router.get('/', async (req, res, next) => {
  try {
    const { featured, county, region, category } = req.query;

    const destinations = await prisma.destination.findMany({
      where: {
        ...(featured === 'true' ? { featured: true } : {}),
        ...(county ? { county: String(county) } : {}),
        ...(region ? { region: String(region) } : {}),
        ...(category ? { category: String(category) } : {}),
      },
      orderBy: { name: 'asc' },
    });

    res.json(destinations);
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/:slug — single destination (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const destination = await prisma.destination.findUnique({
      where: { slug: req.params.slug },
    });

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination);
  } catch (err) {
    next(err);
  }
});

module.exports = router;