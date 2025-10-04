const express = require('express');
const Measurement = require('../models/Measurement');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all measurements for a user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, anomaly } = req.query;
    const query = { userId: req.user.userId };
    
    if (anomaly !== undefined) {
      query.isAnomaly = anomaly === 'true';
    }

    const measurements = await Measurement.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');

    const total = await Measurement.countDocuments(query);

    res.json({
      success: true,
      data: measurements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Get single measurement
router.get('/:id', auth, async (req, res) => {
  try {
    const measurement = await Measurement.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!measurement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy kết quả đo' 
      });
    }

    res.json({
      success: true,
      data: measurement
    });
  } catch (error) {
    console.error('Get measurement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Create new measurement
router.post('/', auth, async (req, res) => {
  try {
    const { ecgData, heartRate, prediction, confidence, symptoms, notes } = req.body;

    // Basic validation
    if (!ecgData || !Array.isArray(ecgData) || ecgData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dữ liệu ECG không hợp lệ' 
      });
    }

    if (!heartRate || heartRate < 30 || heartRate > 200) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nhịp tim không hợp lệ' 
      });
    }

    // Determine risk level based on prediction and confidence
    let riskLevel = 'Low';
    if (prediction !== 'Normal') {
      if (confidence > 0.8) {
        riskLevel = 'High';
      } else if (confidence > 0.6) {
        riskLevel = 'Medium';
      }
    }

    const measurement = new Measurement({
      userId: req.user.userId,
      ecgData,
      heartRate,
      prediction,
      confidence,
      riskLevel,
      symptoms: symptoms || [],
      notes,
      isAnomaly: prediction !== 'Normal'
    });

    await measurement.save();

    res.status(201).json({
      success: true,
      message: 'Lưu kết quả đo thành công',
      data: measurement
    });
  } catch (error) {
    console.error('Create measurement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Update measurement
router.put('/:id', auth, async (req, res) => {
  try {
    const { symptoms, notes } = req.body;
    
    const measurement = await Measurement.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { symptoms, notes },
      { new: true, runValidators: true }
    );

    if (!measurement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy kết quả đo' 
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thành công',
      data: measurement
    });
  } catch (error) {
    console.error('Update measurement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
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
        message: 'Không tìm thấy kết quả đo' 
      });
    }

    res.json({
      success: true,
      message: 'Xóa kết quả đo thành công'
    });
  } catch (error) {
    console.error('Delete measurement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Get statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const total = await Measurement.countDocuments({ userId });
    const anomalies = await Measurement.countDocuments({ userId, isAnomaly: true });
    const recent = await Measurement.countDocuments({ 
      userId, 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    });

    const avgHeartRate = await Measurement.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avg: { $avg: '$heartRate' } } }
    ]);

    const predictionStats = await Measurement.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$prediction', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        anomalies,
        recent,
        avgHeartRate: avgHeartRate[0]?.avg || 0,
        predictionStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

module.exports = router;
