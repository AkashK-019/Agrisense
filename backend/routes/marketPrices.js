const express = require('express');
const router = express.Router();
const MarketPrice = require('../models/MarketPrice');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const prices = await MarketPrice.find().sort({ recordedAt: -1 });
    res.json({ prices });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch market prices.' });
  }
});

// GET /api/market-prices/:id
router.get('/:id', async (req, res) => {
  try {
    const price = await MarketPrice.findById(req.params.id);
    if (!price) return res.status(404).json({ message: 'Price entry not found.' });
    res.json({ price });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch price.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const price = await MarketPrice.create(req.body);
    res.status(201).json({ price });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create market price entry.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const price = await MarketPrice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!price) return res.status(404).json({ message: 'Price entry not found.' });
    res.json({ price });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update price.' });
  }
});

// DELETE /api/market-prices/:id
router.delete('/:id', async (req, res) => {
  try {
    await MarketPrice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Price entry deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete price.' });
  }
});

module.exports = router;