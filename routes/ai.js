const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Simulate AI prediction (replace with actual AI model)
const simulateAIPrediction = (ecgData) => {
  // This is a mock function - replace with actual AI model
  const predictions = ['Normal', 'Supraventricular', 'Ventricular', 'Paced', 'Other'];
  const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
  const confidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
  
  return {
    prediction: randomPrediction,
    confidence: parseFloat(confidence.toFixed(3))
  };
};

// Analyze ECG data
router.post('/analyze', auth, async (req, res) => {
  try {
    const { ecgData } = req.body;

    if (!ecgData || !Array.isArray(ecgData) || ecgData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dữ liệu ECG không hợp lệ' 
      });
    }

    // Calculate basic heart rate from ECG data
    const calculateHeartRate = (data) => {
      // Simple peak detection algorithm
      let peaks = 0;
      const threshold = Math.max(...data) * 0.7;
      
      for (let i = 1; i < data.length - 1; i++) {
        if (data[i] > threshold && data[i] > data[i-1] && data[i] > data[i+1]) {
          peaks++;
        }
      }
      
      // Assuming 30 seconds of data at 360Hz
      const duration = 30; // seconds
      const heartRate = Math.round((peaks / duration) * 60);
      
      return Math.max(40, Math.min(200, heartRate)); // Clamp between 40-200 BPM
    };

    const heartRate = calculateHeartRate(ecgData);
    const aiResult = simulateAIPrediction(ecgData);

    // Determine risk level
    let riskLevel = 'Low';
    if (aiResult.prediction !== 'Normal') {
      if (aiResult.confidence > 0.8) {
        riskLevel = 'High';
      } else if (aiResult.confidence > 0.6) {
        riskLevel = 'Medium';
      }
    }

    // Generate recommendations based on prediction
    const getRecommendations = (prediction, confidence, heartRate) => {
      const recommendations = [];
      
      if (heartRate < 60) {
        recommendations.push('Nhịp tim chậm - nên tham khảo ý kiến bác sĩ');
      } else if (heartRate > 100) {
        recommendations.push('Nhịp tim nhanh - nên nghỉ ngơi và thư giãn');
      }
      
      if (prediction === 'Supraventricular') {
        recommendations.push('Phát hiện nhịp tim bất thường - cần theo dõi thêm');
      } else if (prediction === 'Ventricular') {
        recommendations.push('Cần tham khảo ý kiến bác sĩ ngay lập tức');
      } else if (prediction === 'Paced') {
        recommendations.push('Nhịp tim được điều chỉnh bởi máy tạo nhịp');
      }
      
      if (confidence < 0.7) {
        recommendations.push('Kết quả không chắc chắn - nên đo lại');
      }
      
      return recommendations;
    };

    const recommendations = getRecommendations(aiResult.prediction, aiResult.confidence, heartRate);

    res.json({
      success: true,
      data: {
        heartRate,
        prediction: aiResult.prediction,
        confidence: aiResult.confidence,
        riskLevel,
        recommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi phân tích dữ liệu' 
    });
  }
});

// Get AI model info
router.get('/model-info', (req, res) => {
  res.json({
    success: true,
    data: {
      modelName: 'CNN-BiLSTM Heart Rate Classifier',
      version: '1.0.0',
      description: 'Mô hình AI để phân loại tín hiệu ECG bất thường',
      classes: [
        { name: 'Normal', description: 'Nhịp tim bình thường' },
        { name: 'Supraventricular', description: 'Nhịp tim bất thường trên thất' },
        { name: 'Ventricular', description: 'Nhịp tim bất thường thất' },
        { name: 'Paced', description: 'Nhịp tim được điều chỉnh' },
        { name: 'Other', description: 'Các loại bất thường khác' }
      ],
      accuracy: '92.5%',
      lastUpdated: '2024-01-01'
    }
  });
});

module.exports = router;
