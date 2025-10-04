const express = require('express');
const auth = require('../middleware/auth');
const Measurement = require('../models/Measurement');

const router = express.Router();

// ML: Get available classes
router.get('/classes', (req, res) => {
  const classes = [
    { id: 0, code: 'N', name: 'Normal' },
    { id: 1, code: 'S', name: 'Supraventricular' },
    { id: 2, code: 'V', name: 'Ventricular' },
    { id: 3, code: 'F', name: 'Fusion' },
    { id: 4, code: 'Q', name: 'Unknown' }
  ];
  res.json({ success: true, classes });
});

// ML: Predict ECG signal
router.post('/predict', auth, async (req, res) => {
  try {
    const { signal, meta } = req.body || {};
    
    if (!Array.isArray(signal) || signal.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu dữ liệu tín hiệu (signal)' 
      });
    }

    // Mock prediction algorithm (replace with real ML model)
    const length = signal.length;
    const min = Math.min(...signal);
    const max = Math.max(...signal);
    const mean = signal.reduce((a, b) => a + b, 0) / length;
    const varSum = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / length;
    const std = Math.sqrt(varSum);

    
    const heartRate = Math.round(60 / (std * 0.01) || 72);

    
    const raw = [
      Math.abs(mean),
      Math.abs(std),
      Math.abs(max),
      Math.abs(min),
      Math.abs(max - min)
    ];
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    const probabilities = raw.map(v => v / sum);

    
    let bestIdx = 0;
    for (let i = 1; i < probabilities.length; i++) {
      if (probabilities[i] > probabilities[bestIdx]) bestIdx = i;
    }

    const classes = ['Normal', 'Supraventricular', 'Ventricular', 'Fusion', 'Unknown'];
    const prediction = classes[bestIdx];
    const confidence = probabilities[bestIdx];

    
    let riskLevel = 'Low';
    if (confidence > 0.7 && bestIdx !== 0) riskLevel = 'High';
    else if (confidence > 0.5 && bestIdx !== 0) riskLevel = 'Medium';

    
    const isAnomaly = bestIdx !== 0 && confidence > 0.5;

    
    const measurement = new Measurement({
      userId: req.user.userId,
      ecgData: signal,
      heartRate: heartRate,
      prediction: prediction,
      confidence: confidence,
      riskLevel: riskLevel,
      symptoms: meta?.symptoms || [],
      notes: meta?.notes || '',
      isAnomaly: isAnomaly,
      deviceInfo: meta?.deviceInfo || 'AD8232 ECG Sensor',
      measurementDuration: meta?.duration || 30
    });

    await measurement.save();

    res.json({
      success: true,
      prediction: {
        id: measurement._id,
        userId: req.user.userId,
        createdAt: measurement.createdAt,
        classIndex: bestIdx,
        classCode: classes[bestIdx],
        prediction: prediction,
        confidence: confidence,
        heartRate: heartRate,
        riskLevel: riskLevel,
        isAnomaly: isAnomaly,
        probabilities: probabilities,
        length: length,
        stats: { min, max, mean, std },
        meta: meta || null
      }
    });

  } catch (error) {
    console.error('Predict error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

module.exports = router;
