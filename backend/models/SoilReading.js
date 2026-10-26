const mongoose = require('mongoose');

const soilReadingSchema = new mongoose.Schema(
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
    moisture: { type: Number, min: 0, max: 100 },
    pH: { type: Number, min: 0, max: 14 },
    nitrogen: { type: Number, min: 0 },
    phosphorus: { type: Number, min: 0 },
    potassium: { type: Number, min: 0 },
    temperature: { type: Number },
    source: {
      type: String,
      default: 'Manual Entry',
      trim: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SoilReading', soilReadingSchema);