const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });


const User = require('../models/User');
const Measurement = require('../models/Measurement');

async function checkDatabaseStatus() {
  try {
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heart-rate-monitor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Get database info
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    
    console.log(`\n📊 Database: ${dbName}`);
    console.log('=' .repeat(50));

    
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Collections (${collections.length}):`);
    for (const collection of collections) {
      const stats = await db.collection(collection.name).stats();
      console.log(`  • ${collection.name}: ${stats.count} documents`);
    }

    
    const userCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userRoleCount = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ isActive: true });

    console.log(`\n👥 Users (${userCount}):`);
    console.log(`  • Admins: ${adminCount}`);
    console.log(`  • Regular users: ${userRoleCount}`);
    console.log(`  • Active: ${activeUsers}`);
    console.log(`  • Inactive: ${userCount - activeUsers}`);

    // Check measurements
    const measurementCount = await Measurement.countDocuments();
    const anomalyCount = await Measurement.countDocuments({ isAnomaly: true });
    const normalCount = await Measurement.countDocuments({ isAnomaly: false });

    console.log(`\n📊 Measurements (${measurementCount}):`);
    console.log(`  • Normal: ${normalCount}`);
    console.log(`  • Anomalies: ${anomalyCount}`);

    // Check recent activity
    const recentMeasurements = await Measurement.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .lean();

    console.log(`\n🕒 Recent measurements:`);
    for (const measurement of recentMeasurements) {
      const date = new Date(measurement.createdAt).toLocaleString();
      const user = measurement.userId ? measurement.userId.name : 'Unknown';
      console.log(`  • ${date} - ${user} (${measurement.prediction})`);
    }

    // Check database size
    const stats = await db.stats();
    const sizeInMB = (stats.dataSize / 1024 / 1024).toFixed(2);
    const storageInMB = (stats.storageSize / 1024 / 1024).toFixed(2);

    console.log(`\n💾 Database size:`);
    console.log(`  • Data size: ${sizeInMB} MB`);
    console.log(`  • Storage size: ${storageInMB} MB`);

    // Check indexes
    console.log(`\n🔍 Indexes:`);
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      console.log(`  • ${collection.name}: ${indexes.length} indexes`);
      for (const index of indexes) {
        const keys = Object.keys(index.key).join(', ');
        console.log(`    - ${index.name}: ${keys}`);
      }
    }

    console.log('\n✅ Database status check completed!');

  } catch (error) {
    console.error('❌ Error checking database status:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabaseStatus();
}

module.exports = checkDatabaseStatus;
