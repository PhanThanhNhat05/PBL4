const mongoose = require('mongoose');
require('dotenv').config({ path: '../config.env' });

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log(`📍 URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/heart-rate-monitor'}`);
    
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heart-rate-monitor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  • ${collection.name}: ${count} documents`);
    }
    
    
    const pingResult = await db.admin().ping();
    console.log(`🏓 Ping result: ${JSON.stringify(pingResult)}`);
    
    console.log('\n✅ All tests passed! Database is ready to use.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('💡 Please check:');
    console.error('  • MongoDB server is running');
    console.error('  • Connection string is correct');
    console.error('  • Network connectivity');
    console.error('  • Authentication credentials');
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}


if (require.main === module) {
  testConnection();
}

module.exports = testConnection;
