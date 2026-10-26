const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');

// Helper: generate
const generateToken = (farmerId) => {
  return jwt.sign({ farmerId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone')
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
    body('pin')
      .isLength({ min: 4, max: 6 })
      .isNumeric()
      .withMessage('PIN must be 4-6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, phone, pin } = req.body;

    try {
      const existing = await Farmer.findOne({ phone });
      if (existing) {
        return res.status(409).json({ message: 'A farmer account with this mobile number already exists.' });
      }

      const farmer = await Farmer.create({
        name,
        phone,
        pinHash: pin,
        language: req.body.language || 'en',
      });

      const token = generateToken(farmer._id);

      res.status(201).json({
        token,
        farmer: {
          _id: farmer._id,
          name: farmer.name,
          phone: farmer.phone,
          language: farmer.language,
          areaUnit: farmer.areaUnit,
          weightUnit: farmer.weightUnit,
          createdAt: farmer.createdAt,
        },
      });
    } catch (err) {
      console.error('[auth/register]', err);
      res.status(500).json({ message: 'Server error during registration.' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('phone').trim().notEmpty().withMessage('Mobile number is required'),
    body('pin').notEmpty().withMessage('PIN is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { phone, pin } = req.body;

    try {
      const farmer = await Farmer.findOne({ phone }).select('+pinHash');
      if (!farmer) {
        return res.status(401).json({ message: 'No account found with this mobile number.' });
      }

      const isMatch = await farmer.comparePin(pin);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect PIN. Please try again.' });
      }

      const token = generateToken(farmer._id);

      res.json({
        token,
        farmer: {
          _id: farmer._id,
          name: farmer.name,
          phone: farmer.phone,
          language: farmer.language,
          areaUnit: farmer.areaUnit,
          weightUnit: farmer.weightUnit,
          createdAt: farmer.createdAt,
        },
      });
    } catch (err) {
      console.error('[auth/login]', err);
      res.status(500).json({ message: 'Server error during login.' });
    }
  }
);

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmerId);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }
    res.json({ farmer });
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, language, areaUnit, weightUnit } = req.body;
    const updatable = {};
    if (name) updatable.name = name;
    if (language) updatable.language = language;
    if (areaUnit) updatable.areaUnit = areaUnit;
    if (weightUnit) updatable.weightUnit = weightUnit;

    const farmer = await Farmer.findByIdAndUpdate(
      req.farmerId,
      { $set: updatable },
      { new: true, runValidators: true }
    );
    res.json({ farmer });
  } catch (err) {
    console.error('[auth/profile]', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// PATCH /api/auth/change-pin
router.patch(
  '/change-pin',
  auth,
  [
    body('currentPin').notEmpty().withMessage('Current PIN is required'),
    body('newPin')
      .isLength({ min: 4, max: 6 })
      .isNumeric()
      .withMessage('New PIN must be 4-6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const farmer = await Farmer.findById(req.farmerId).select('+pinHash');
      const isMatch = await farmer.comparePin(req.body.currentPin);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current PIN is incorrect.' });
      }
      farmer.pinHash = req.body.newPin;
      await farmer.save();
      res.json({ message: 'PIN changed successfully.' });
    } catch (err) {
      console.error('[auth/change-pin]', err);
      res.status(500).json({ message: 'Failed to change PIN.' });
    }
  }
);

module.exports = router;