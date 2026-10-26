const mongoose = require('mongoose');

/* MarketPrice — */
const marketPriceSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
    },
    marketName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    previousPrice: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      default: 'Quintal',
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    trend: {
      type: String,
      enum: ['Up', 'Down', 'Stable'],
      default: 'Stable',
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
    forecastPrice: { type: Number },
    forecastDate: { type: Date },
    forecastTrend: { type: String, enum: ['Upward', 'Downward', 'Stable'] },
    advisoryDecision: { type: String, trim: true },
    advisoryReason: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MarketPrice', marketPriceSchema);