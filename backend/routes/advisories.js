const express = require('express');
const router = express.Router();
const Advisory = require('../models/Advisory');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const advisories = await Advisory.find().sort({ createdAt: -1 });
    const farmerId = req.farmerId.toString();
    const result = advisories.map((a) => ({
      ...a.toObject(),
      saved: a.savedBy.some((id) => id.toString() === farmerId),
    }));
    res.json({ advisories: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch advisories.' });
  }
});

router.patch('/:id/save', async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id);
    if (!advisory) return res.status(404).json({ message: 'Advisory not found.' });

    const farmerId = req.farmerId.toString();
    const alreadySaved = advisory.savedBy.some((id) => id.toString() === farmerId);

    if (alreadySaved) {
      advisory.savedBy = advisory.savedBy.filter((id) => id.toString() !== farmerId);
    } else {
      advisory.savedBy.push(req.farmerId);
    }
    await advisory.save();

    res.json({ saved: !alreadySaved, message: alreadySaved ? 'Advisory unsaved.' : 'Advisory saved.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle advisory save.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const advisory = await Advisory.create(req.body);
    res.status(201).json({ advisory });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create advisory.' });
  }
});

module.exports = router;