const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ farmerId: req.farmerId }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.farmerId },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification as read.' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ farmerId: req.farmerId, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all as read.' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({ farmerId: req.farmerId });
    res.json({ message: 'All notifications cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, farmerId: req.farmerId });
    res.json({ message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification.' });
  }
});

module.exports = router;