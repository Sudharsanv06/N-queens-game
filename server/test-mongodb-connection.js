import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGO_URI ? MONGO_URI.substring(0, 50) + '...' : 'NOT SET');

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

console.log('\nAttempting to connect...\n');

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Connection state: ${mongoose.connection.readyState}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED! MongoDB connection error:', error.message);
    console.error('\nFull error:', error);
    console.error('\n💡 Possible issues:');
    console.error('   1. Cluster hostname is incorrect or cluster does not exist');
    console.error('   2. Network Access not configured in MongoDB Atlas');
    console.error('   3. Database user credentials are wrong');
    console.error('   4. Connection string format is incorrect');
    process.exit(1);
  });
