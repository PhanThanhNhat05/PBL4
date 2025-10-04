const express = require('express');
const auth = require('../middleware/auth');
const Measurement = require('../models/Measurement');

const router = express.Router();

// Get measurement history with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.userId };
    
    // Optional filters
    if (req.query.isAnomaly !== undefined) {
      filter.isAnomaly = req.query.isAnomaly === 'true';
    }
    
    if (req.query.riskLevel) {
      filter.riskLevel = req.query.riskLevel;
    }

    if (req.query.prediction) {
      filter.prediction = req.query.prediction;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Get measurements
    const measurements = await Measurement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-ecgData') // Exclude large ECG data for list view
      .lean();

    const total = await Measurement.countDocuments(filter);

    // Transform data for frontend
    const items = measurements.map(measurement => ({
      id: measurement._id,
      userId: measurement.userId,
      createdAt: measurement.createdAt,
      classIndex: getClassIndex(measurement.prediction),
      classCode: getClassCode(measurement.prediction),
      prediction: measurement.prediction,
      confidence: measurement.confidence,
      heartRate: measurement.heartRate,
      riskLevel: measurement.riskLevel,
      isAnomaly: measurement.isAnomaly,
      symptoms: measurement.symptoms,
      notes: measurement.notes,
      deviceInfo: measurement.deviceInfo,
      measurementDuration: measurement.measurementDuration
    }));

    res.json({
      success: true,
      total,
      page,
      limit,
      items
    });

  } catch (error) {
    console.error('History list error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

// Get single measurement by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const measurement = await Measurement.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi'
      });
    }

    res.json({
      success: true,
      measurement: {
        id: measurement._id,
        userId: measurement.userId,
        createdAt: measurement.createdAt,
        updatedAt: measurement.updatedAt,
        classIndex: getClassIndex(measurement.prediction),
        classCode: getClassCode(measurement.prediction),
        prediction: measurement.prediction,
        confidence: measurement.confidence,
        heartRate: measurement.heartRate,
        riskLevel: measurement.riskLevel,
        isAnomaly: measurement.isAnomaly,
        symptoms: measurement.symptoms,
        notes: measurement.notes,
        deviceInfo: measurement.deviceInfo,
        measurementDuration: measurement.measurementDuration,
        ecgData: measurement.ecgData // Include ECG data for detail view
      }
    });

  } catch (error) {
    console.error('Get measurement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

// Delete measurement
router.delete('/:id', auth, async (req, res) => {
  try {
    const measurement = await Measurement.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi'
      });
    }

    res.json({
      success: true,
      message: 'Xóa bản ghi thành công',
      removed: {
        id: measurement._id,
        prediction: measurement.prediction,
        createdAt: measurement.createdAt
      }
    });

  } catch (error) {
    console.error('Delete measurement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

// Get statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [
      totalMeasurements,
      anomalyCount,
      normalCount,
      riskLevels,
      predictions
    ] = await Promise.all([
      Measurement.countDocuments({ userId }),
      Measurement.countDocuments({ userId, isAnomaly: true }),
      Measurement.countDocuments({ userId, isAnomaly: false }),
      Measurement.aggregate([
        { $match: { userId } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]),
      Measurement.aggregate([
        { $match: { userId } },
        { $group: { _id: '$prediction', count: { $sum: 1 } } }
      ])
    ]);

    const riskLevelStats = riskLevels.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const predictionStats = predictions.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        total: totalMeasurements,
        anomalies: anomalyCount,
        normal: normalCount,
        riskLevels: riskLevelStats,
        predictions: predictionStats
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

// Helper functions
function getClassIndex(prediction) {
  const classMap = {
    'Normal': 0,
    'Supraventricular': 1,
    'Ventricular': 2,
    'Fusion': 3,
    'Unknown': 4
  };
  return classMap[prediction] || 0;
}

function getClassCode(prediction) {
  const codeMap = {
    'Normal': 'N',
    'Supraventricular': 'S',
    'Ventricular': 'V',
    'Fusion': 'F',
    'Unknown': 'Q'
  };
  return codeMap[prediction] || 'N';
}

module.exports = router;
