const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/crops?farmId=xxx
router.get('/', async (req, res) => {
  try {
    const query = { farmerId: req.farmerId };
    if (req.query.farmId) query.farmId = req.query.farmId;
    const crops = await Crop.find(query).sort({ createdAt: -1 });
    res.json({ crops });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch crops.' });
  }
});

// POST /api/crops
router.post('/', async (req, res) => {
  try {
    const crop = await Crop.create({ ...req.body, farmerId: req.farmerId });
    res.status(201).json({ crop });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create crop.' });
  }
});

// PATCH /api/crops/:id
router.patch('/:id', async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.farmerId },
      { $set: req.body },
      { new: true }
    );
    if (!crop) return res.status(404).json({ message: 'Crop not found.' });
    res.json({ crop });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update crop.' });
  }
});

// DELETE /api/crops/:id
router.delete('/:id', async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmerId: req.farmerId });
    if (!crop) return res.status(404).json({ message: 'Crop not found.' });
    res.json({ message: 'Crop deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete crop.' });
  }
});

module.exports = router;