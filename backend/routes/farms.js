const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Farm = require('../models/Farm');
const auth = require('../middleware/auth');

// All routes
router.use(auth);

// GET /api/farms
router.get('/', async (req, res) => {
  try {
    const farms = await Farm.find({ farmerId: req.farmerId }).sort({ createdAt: -1 });
    res.json({ farms });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch farms.' });
  }
});

// GET /api/farms/:id
router.get('/:id', async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, farmerId: req.farmerId });
    if (!farm) return res.status(404).json({ message: 'Farm not found.' });
    res.json({ farm });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch farm.' });
  }
});

// POST /api/farms
router.post(
  '/',
  [
    body('farmName').trim().notEmpty().withMessage('Farm name is required'),
    body('village').trim().notEmpty().withMessage('Village is required'),
    body('district').trim().notEmpty().withMessage('District is required'),
    body('area').isFloat({ min: 0.01 }).withMessage('Area must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const farm = await Farm.create({ ...req.body, farmerId: req.farmerId });
      res.status(201).json({ farm });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create farm.' });
    }
  }
);

// PATCH /api/farms/:id
router.patch('/:id', async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.farmerId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!farm) return res.status(404).json({ message: 'Farm not found.' });
    res.json({ farm });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update farm.' });
  }
});

// DELETE /api/farms/:id
router.delete('/:id', async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, farmerId: req.farmerId });
    if (!farm) return res.status(404).json({ message: 'Farm not found.' });
    res.json({ message: 'Farm deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete farm.' });
  }
});

module.exports = router;