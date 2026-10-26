const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
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
      index: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
    },
    sowingDate: {
      type: Date,
    },
    expectedHarvestDate: {
      type: Date,
    },
    cropStage: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Harvested', 'Failed'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', cropSchema);