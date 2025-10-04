const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../config.env' });


const User = require('../models/User');
const Measurement = require('../models/Measurement');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    age: 30,
    gender: 'male',
    phone: '0123456789',
    role: 'admin'
  },
  {
    name: 'Test User',
    email: 'user@example.com',
    password: 'user123',
    age: 25,
    gender: 'female',
    phone: '0987654321',
    role: 'user'
  }
];

const sampleMeasurements = [
  {
    userId: null, 
    ecgData: Array.from({ length: 1000 }, () => Math.random() * 2 - 1),
    heartRate: 72,
    prediction: 'Normal',
    confidence: 0.95,
    riskLevel: 'Low',
    symptoms: ['None'],
    notes: 'Normal heart rhythm detected',
    isAnomaly: false,
    deviceInfo: 'AD8232 ECG Sensor',
    measurementDuration: 30
  },
  {
    userId: null,
    ecgData: Array.from({ length: 1000 }, () => Math.random() * 2 - 1),
    heartRate: 95,
    prediction: 'Supraventricular',
    confidence: 0.78,
    riskLevel: 'Medium',
    symptoms: ['Palpitations', 'Chest discomfort'],
    notes: 'Irregular rhythm detected',
    isAnomaly: true,
    deviceInfo: 'AD8232 ECG Sensor',
    measurementDuration: 30
  }
];

async function initDatabase() {
  try {
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heart-rate-monitor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Measurement.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Create measurements
    console.log('📊 Creating sample measurements...');
    for (let i = 0; i < sampleMeasurements.length; i++) {
      const measurementData = { ...sampleMeasurements[i] };
      measurementData.userId = createdUsers[i % createdUsers.length]._id;
      
      const measurement = new Measurement(measurementData);
      await measurement.save();
      console.log(`✅ Created measurement for user: ${createdUsers[i % createdUsers.length].email}`);
    }

    
    const userCount = await User.countDocuments();
    const measurementCount = await Measurement.countDocuments();
    
    console.log('\n📈 Database initialization completed!');
    console.log(`👥 Users created: ${userCount}`);
    console.log(`📊 Measurements created: ${measurementCount}`);
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
