const mongoose = require('mongoose');

const cropAnalysisSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: false,
      index: true,
    },
    farmName: { type: String, trim: true },
    cropName: { type: String, trim: true },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true,
    },
    imageUrl: { type: String, trim: true },
    diseaseName: { type: String, trim: true },
    marathiDiseaseName: { type: String, trim: true },
    confidence: { type: Number, min: 0, max: 100 },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical', 'None'],
      default: 'None',
    },
    symptoms: [{ type: String }],
    recommendations: {
      curative: [{ type: String }],
      preventive: [{ type: String }],
      chemicalDosage: { type: String },
      organicControl: { type: String },
    },
    modelVersion: { type: String, default: 'AgriSense-CropAI-v1' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CropAnalysis', cropAnalysisSchema);