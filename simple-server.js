
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; 

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo
let users = [];
let nextId = 1;


// Add default demo user if not exists
const DEFAULT_USER = {
  id: nextId++,
  name: 'Demo User',
  email: 'demo@example.com',
  password: '123456',
  age: 25,
  gender: 'other',
  phone: '0123456789',
  role: 'user',
  isActive: true,
  createdAt: new Date()
};
users.push(DEFAULT_USER);



// Helper: extract user from Authorization header (demo token)
function getUserFromRequest(req) {
  const authHeader = req.header('Authorization') || '';
  const prefix = 'Bearer demo_token_';
  if (!authHeader.startsWith(prefix)) return null;
  const idStr = authHeader.substring(prefix.length);
  const userId = Number(idStr);
  if (!Number.isFinite(userId)) return null;
  return users.find(u => u.id === userId && u.isActive !== false) || null;
}

// In-memory predictions history
let predictions = [];
let nextPredictionId = 1;

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;

    console.log('Register request:', { name, email, age, gender, phone });

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email đã được sử dụng' 
      });
    }

    // Create new user
    const user = {
      id: nextId++,
      name,
      email,
      password, // In real app, this should be hashed
      age,
      gender,
      phone,
      role: 'user',
      isActive: true,
      createdAt: new Date()
    };

    users.push(user);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token: 'demo_token_' + user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token: 'demo_token_' + user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

// Get current user (demo)
app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.header('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có token, truy cập bị từ chối'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const prefix = 'demo_token_';
    if (!token.startsWith(prefix)) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    const idStr = token.substring(prefix.length);
    const userId = Number(idStr);
    const user = users.find(u => u.id === userId);

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// ML: classes list ( 5 classes)
app.get('/api/ml/classes', (req, res) => {
  const classes = [
    { id: 0, code: 'N', name: 'Normal' },
    { id: 1, code: 'S', name: 'Supraventricular' },
    { id: 2, code: 'V', name: 'Ventricular' },
    { id: 3, code: 'F', name: 'Fusion' },
    { id: 4, code: 'Q', name: 'Unknown' }
  ];
  res.json({ success: true, classes });
});

// ML: predict (mock inference). Accepts { signal: number[], meta?: any }
// Stores result in history for the authenticated user
app.post('/api/ml/predict', (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }

    const { signal, meta } = req.body || {};
    if (!Array.isArray(signal) || signal.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu tín hiệu (signal)' });
    }

    // Mock scores: compute simple statistics to generate deterministic pseudo-probabilities
    const length = signal.length;
    const min = Math.min(...signal);
    const max = Math.max(...signal);
    const mean = signal.reduce((a, b) => a + b, 0) / length;
    const varSum = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / length;
    const std = Math.sqrt(varSum);

    // Create 5 raw scores from stats (arbitrary mapping for demo)
    const raw = [
      Math.abs(mean),
      Math.abs(std),
      Math.abs(max),
      Math.abs(min),
      Math.abs(max - min)
    ];
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    const probs = raw.map(v => v / sum);

    // Argmax class
    let bestIdx = 0;
    for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;

    const classes = ['N', 'S', 'V', 'F', 'Q'];
    const prediction = {
      id: nextPredictionId++,
      userId: user.id,
      createdAt: new Date().toISOString(),
      classIndex: bestIdx,
      classCode: classes[bestIdx],
      probabilities: probs,
      length,
      stats: { min, max, mean, std },
      meta: meta || null
    };

    predictions.unshift(prediction);

    res.json({ success: true, prediction });
  } catch (error) {
    console.error('Predict error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// History: list predictions for current user, with pagination
app.get('/api/history', (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const all = predictions.filter(p => p.userId === user.id);
    const total = all.length;
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);
    res.json({ success: true, total, page, limit, items });
  } catch (error) {
    console.error('History list error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// History: delete one item
app.delete('/api/history/:id', (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }
    const id = Number(req.params.id);
    const idx = predictions.findIndex(p => p.id === id && p.userId === user.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi' });
    }
    const removed = predictions.splice(idx, 1)[0];
    res.json({ success: true, removed });
  } catch (error) {
    console.error('History delete error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// User Profile: get current user's profile
app.get('/api/users/profile', (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }

    const data = {
      _id: String(user.id),
      name: user.name || '',
      email: user.email,
      age: user.age ?? null,
      gender: user.gender || '',
      phone: user.phone || '',
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : (user.createdAt || new Date().toISOString())
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// User Profile: update current user's profile
app.put('/api/users/profile', (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }

    const { name, age, gender, phone } = req.body || {};
    if (typeof name === 'string') user.name = name;
    if (age !== undefined) {
      const numAge = Number(age);
      if (Number.isFinite(numAge)) user.age = numAge;
    }
    if (typeof gender === 'string') user.gender = gender;
    if (typeof phone === 'string') user.phone = phone;

    const data = {
      _id: String(user.id),
      name: user.name || '',
      email: user.email,
      age: user.age ?? null,
      gender: user.gender || '',
      phone: user.phone || '',
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : (user.createdAt || new Date().toISOString())
    };

    res.json({ success: true, data, message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
});

// Get users (for testing)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }))
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple server is running on port ${PORT}`);
  console.log(`📝 Users stored in memory: ${users.length}`);
});
