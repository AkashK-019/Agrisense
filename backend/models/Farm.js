const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true,
    },
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      default: 'Maharashtra',
      trim: true,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      addressText: { type: String, trim: true },
    },
    area: {
      type: Number,
      required: [true, 'Farm area is required'],
      min: [0.01, 'Area must be positive'],
    },
    soilType: {
      type: String,
      trim: true,
    },
    irrigationType: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farm', farmSchema);