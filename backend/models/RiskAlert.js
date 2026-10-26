const mongoose = require('mongoose');

const riskAlertSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    marathiTitle: { type: String, trim: true },
    description: { type: String, trim: true },
    marathiDescription: { type: String, trim: true },
    source: { type: String, trim: true },
    possibleCauses: [{ type: String }],
    recommendedAction: { type: String, trim: true },
    marathiRecommendedAction: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Active', 'Acknowledged', 'Resolved'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiskAlert', riskAlertSchema);