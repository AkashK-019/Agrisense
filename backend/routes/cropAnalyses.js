const express = require('express');
const router = express.Router();
const CropAnalysis = require('../models/CropAnalysis');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/crop-analyses?farmId=xxx
router.get('/', async (req, res) => {
  try {
    const query = { farmerId: req.farmerId };
    if (req.query.farmId) query.farmId = req.query.farmId;
    const analyses = await CropAnalysis.find(query).sort({ createdAt: -1 }).limit(20);
    res.json({ analyses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch crop analyses.' });
  }
});

// POST /api/crop-analyses
router.post('/', async (req, res) => {
  try {
    const analysis = await CropAnalysis.create({ ...req.body, farmerId: req.farmerId });
    res.status(201).json({ analysis });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save crop analysis.' });
  }
});

// DELETE /api/crop-analyses/:id
router.delete('/:id', async (req, res) => {
  try {
    await CropAnalysis.findOneAndDelete({ _id: req.params.id, farmerId: req.farmerId });
    res.json({ message: 'Analysis deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete analysis.' });
  }
});

module.exports = router;