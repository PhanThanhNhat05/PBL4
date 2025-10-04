const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../config.env' });


const User = require('../models/User');
const Measurement = require('../models/Measurement');

async function restoreDatabase(backupFile) {
  try {
    
    if (!fs.existsSync(backupFile)) {
      console.error(`❌ Backup file not found: ${backupFile}`);
      return;
    }

    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heart-rate-monitor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

   
    console.log('📖 Reading backup file...');
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    console.log(`📅 Backup date: ${backupData.timestamp}`);
    console.log(`🗄️  Database: ${backupData.database}`);

    
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Measurement.deleteMany({});
    console.log('✅ Existing data cleared');

    
    console.log('👥 Restoring users...');
    const users = backupData.collections.users;
    const createdUsers = [];
    
    for (const userData of users) {
      
      delete userData._id;
      delete userData.__v;
      
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`✅ Restored ${users.length} users`);

    
    const userMap = new Map();
    for (let i = 0; i < users.length; i++) {
      userMap.set(users[i]._id.toString(), createdUsers[i]._id);
    }

    
    console.log('📊 Restoring measurements...');
    const measurements = backupData.collections.measurements;
    let restoredCount = 0;

    for (const measurementData of measurements) {
      
      const oldUserId = measurementData.userId.toString();
      if (userMap.has(oldUserId)) {
        measurementData.userId = userMap.get(oldUserId);
      } else {
        console.warn(`⚠️  User not found for measurement: ${oldUserId}`);
        continue;
      }

      
      delete measurementData._id;
      delete measurementData.__v;

      const measurement = new Measurement(measurementData);
      await measurement.save();
      restoredCount++;
    }
    console.log(`✅ Restored ${restoredCount} measurements`);

    
    console.log('\n📈 Database restoration completed!');
    console.log(`👥 Users restored: ${users.length}`);
    console.log(`📊 Measurements restored: ${restoredCount}`);

  } catch (error) {
    console.error('❌ Error restoring database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  const backupFile = process.argv[2];
  if (!backupFile) {
    console.log('Usage: node restore-database.js <backup-file>');
    console.log('Example: node restore-database.js ../backups/backup-2024-01-01T00-00-00-000Z.json');
    process.exit(1);
  }
  restoreDatabase(backupFile);
}

module.exports = restoreDatabase;
