const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

// Import models
const User = require('../models/User');
const Measurement = require('../models/Measurement');

async function testAtlasConnection() {
  try {
    console.log('🌐 Testing MongoDB Atlas connection...');
    console.log('=' .repeat(50));
    
    // Display connection info
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/heart-rate-monitor';
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`📍 URI: ${maskedUri}`);
    
    // Connect to Atlas
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // Test collections
    console.log('\n📁 Checking collections...');
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  • ${collection.name}: ${count} documents`);
    }
    
    
    console.log('\n🏓 Testing ping...');
    const pingResult = await db.admin().ping();
    console.log(`Ping result: ${JSON.stringify(pingResult)}`);
    
    
    console.log('\n🧪 Testing model operations...');
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Test Measurement model
    const measurementCount = await Measurement.countDocuments();
    console.log(`📊 Measurements in database: ${measurementCount}`);
    
    // Test recent measurements
    if (measurementCount > 0) {
      const recentMeasurement = await Measurement.findOne()
        .sort({ createdAt: -1 })
        .populate('userId', 'name email')
        .lean();
      
      if (recentMeasurement) {
        console.log(`📈 Latest measurement: ${recentMeasurement.prediction} (${recentMeasurement.heartRate} BPM)`);
      }
    }
    
    
    console.log('\n🔍 Checking indexes...');
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      console.log(`  • ${collection.name}: ${indexes.length} indexes`);
    }
    
    
    console.log('\n✍️  Testing write operation...');
    const testUser = new User({
      name: 'Atlas Test User',
      email: 'atlas-test@example.com',
      password: 'test123',
      role: 'user'
    });
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'atlas-test@example.com' });
    if (existingUser) {
      console.log('ℹ️  Test user already exists, skipping creation');
    } else {
      await testUser.save();
      console.log('✅ Test user created successfully');
      
      
      await User.deleteOne({ email: 'atlas-test@example.com' });
      console.log('🧹 Test user cleaned up');
    }
    
    
    console.log('\n🌐 Atlas Information:');
    console.log(`  • Database: ${dbName}`);
    console.log(`  • Collections: ${collections.length}`);
    console.log(`  • Total documents: ${userCount + measurementCount}`);
    console.log(`  • Connection: Atlas Cloud`);
    
    console.log('\n✅ All Atlas tests passed! Database is ready for production.');
    
  } catch (error) {
    console.error('\n❌ Atlas connection test failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('  1. Check your MONGODB_URI in config.env');
    console.error('  2. Verify username/password in connection string');
    console.error('  3. Check IP whitelist in Atlas dashboard');
    console.error('  4. Ensure cluster is running');
    console.error('  5. Check network connectivity');
    
    if (error.message.includes('authentication')) {
      console.error('\n🔐 Authentication Error:');
      console.error('  • Verify username and password');
      console.error('  • Check database user permissions');
      console.error('  • Ensure user has Atlas admin role');
    }
    
    if (error.message.includes('network')) {
      console.error('\n🌐 Network Error:');
      console.error('  • Check IP whitelist (0.0.0.0/0 for development)');
      console.error('  • Verify firewall settings');
      console.error('  • Try different region');
    }
    
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Atlas connection closed');
  }
}


if (require.main === module) {
  testAtlasConnection();
}

module.exports = testAtlasConnection;
