const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ecgData: {
    type: [Number],
    required: true
  },
  heartRate: {
    type: Number,
    required: true
  },
  prediction: {
    type: String,
    enum: ['Normal', 'Supraventricular', 'Ventricular', 'Paced', 'Other'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  symptoms: [{
    type: String
  }],
  notes: {
    type: String,
    trim: true
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  deviceInfo: {
    type: String,
    default: 'AD8232 ECG Sensor'
  },
  measurementDuration: {
    type: Number, // in seconds
    default: 30
  }
}, {
  timestamps: true
});

// Index for efficient queries
measurementSchema.index({ userId: 1, createdAt: -1 });
measurementSchema.index({ isAnomaly: 1 });

module.exports = mongoose.model('Measurement', measurementSchema);
