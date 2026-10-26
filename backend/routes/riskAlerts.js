const express = require('express');
const router = express.Router();
const RiskAlert = require('../models/RiskAlert');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/risk-alerts?farmId=xxx
router.get('/', async (req, res) => {
  try {
    const query = { farmerId: req.farmerId };
    if (req.query.farmId) query.farmId = req.query.farmId;
    const alerts = await RiskAlert.find(query).sort({ createdAt: -1 });
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch risk alerts.' });
  }
});

// POST /api/risk-alerts
router.post('/', async (req, res) => {
  try {
    const alert = await RiskAlert.create({ ...req.body, farmerId: req.farmerId });
    res.status(201).json({ alert });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create risk alert.' });
  }
});

// PATCH /api/risk-alerts/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Acknowledged', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const alert = await RiskAlert.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.farmerId },
      { $set: { status } },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Risk alert not found.' });
    res.json({ alert });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update risk alert.' });
  }
});

// DELETE /api/risk-alerts/:id
router.delete('/:id', async (req, res) => {
  try {
    await RiskAlert.findOneAndDelete({ _id: req.params.id, farmerId: req.farmerId });
    res.json({ message: 'Alert deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete alert.' });
  }
});

module.exports = router;