const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../config.env' });

// Import models
const User = require('../models/User');
const Measurement = require('../models/Measurement');

async function backupDatabase() {
  try {
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heart-rate-monitor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Create backup directory
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    
    console.log('📊 Exporting data...');
    const users = await User.find({}).lean();
    const measurements = await Measurement.find({}).lean();

    const backupData = {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.db.databaseName,
      collections: {
        users: users,
        measurements: measurements
      },
      counts: {
        users: users.length,
        measurements: measurements.length
      }
    };

    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);

    // Display summary
    console.log('\n📈 Backup completed!');
    console.log(`👥 Users backed up: ${users.length}`);
    console.log(`📊 Measurements backed up: ${measurements.length}`);
    console.log(`📁 Backup file: ${backupFile}`);

  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  backupDatabase();
}

module.exports = backupDatabase;
