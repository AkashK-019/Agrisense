const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    pinHash: {
      type: String,
      required: true,
      select: false,
    },
    language: {
      type: String,
      enum: ['en', 'mr'],
      default: 'en',
    },
    areaUnit: {
      type: String,
      enum: ['acres', 'hectares', 'guntha'],
      default: 'acres',
    },
    weightUnit: {
      type: String,
      enum: ['quintal', 'kg', 'ton'],
      default: 'quintal',
    },
  },
  { timestamps: true }
);

// Hash PIN
farmerSchema.pre('save', async function (next) {
  if (!this.isModified('pinHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.pinHash = await bcrypt.hash(this.pinHash, salt);
  next();
});

// Method to
farmerSchema.methods.comparePin = async function (enteredPin) {
  return bcrypt.compare(enteredPin, this.pinHash);
};

module.exports = mongoose.model('Farmer', farmerSchema);