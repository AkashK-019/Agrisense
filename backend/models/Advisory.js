const mongoose = require('mongoose');

/* Advisory — */
const advisorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    marathiTitle: { type: String, trim: true },
    content: { type: String, required: true },
    marathiContent: { type: String },
    cropStage: { type: String, trim: true },
    actionItem: { type: String, trim: true },
    marathiActionItem: { type: String, trim: true },
    source: { type: String, trim: true },
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Advisory', advisorySchema);