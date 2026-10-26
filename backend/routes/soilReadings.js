const express = require('express');
const router = express.Router();
const SoilReading = require('../models/SoilReading');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/soil-readings?farmId=xxx
router.get('/', async (req, res) => {
  try {
    const query = { farmerId: req.farmerId };
    if (req.query.farmId) query.farmId = req.query.farmId;
    const readings = await SoilReading.find(query).sort({ recordedAt: -1 }).limit(50);
    res.json({ readings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch soil readings.' });
  }
});

// POST /api/soil-readings
router.post('/', async (req, res) => {
  try {
    const reading = await SoilReading.create({ ...req.body, farmerId: req.farmerId });
    res.status(201).json({ reading });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save soil reading.' });
  }
});

// DELETE /api/soil-readings/:id
router.delete('/:id', async (req, res) => {
  try {
    await SoilReading.findOneAndDelete({ _id: req.params.id, farmerId: req.farmerId });
    res.json({ message: 'Reading deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete reading.' });
  }
});

module.exports = router;