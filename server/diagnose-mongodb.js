#!/usr/bin/env node
/**
 * MongoDB Connection Diagnostic Tool
 * Run this in Render Shell to diagnose connection issues
 */

import mongoose from 'mongoose';
import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);

console.log('🔍 MongoDB Connection Diagnostic Tool\n');

// 1. Check environment variable
console.log('1️⃣ Checking MONGO_URI environment variable...');
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI is not set!');
  console.error('   Set it in Render → Environment variables');
  process.exit(1);
}

console.log('✅ MONGO_URI is set');
console.log(`   Format: ${MONGO_URI.slice(0, 20)}...${MONGO_URI.slice(-30)}`);
console.log(`   Length: ${MONGO_URI.length} characters\n`);

// 2. Parse connection string
console.log('2️⃣ Parsing connection string...');
try {
  const url = new URL(MONGO_URI.replace('mongodb+srv://', 'https://'));
  console.log('✅ Connection string is valid URL format');
  console.log(`   Protocol: mongodb+srv://`);
  console.log(`   Username: ${url.username || 'NOT_SET'}`);
  console.log(`   Password: ${url.password ? '***' + url.password.slice(-4) : 'NOT_SET'}`);
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Database: ${url.pathname.slice(1).split('?')[0]}\n`);
} catch (err) {
  console.error('❌ Invalid connection string format:', err.message);
  console.error('   Expected: mongodb+srv://user:pass@host/database?options');
  process.exit(1);
}

// 3. Test DNS SRV resolution
console.log('3️⃣ Testing DNS SRV resolution...');
const hostname = MONGO_URI.match(/@([^/]+)/)?.[1];
if (hostname) {
  const srvRecord = `_mongodb._tcp.${hostname}`;
  console.log(`   Querying: ${srvRecord}`);
  
  try {
    const records = await resolveSrv(srvRecord);
    console.log(`✅ DNS SRV resolution successful`);
    console.log(`   Found ${records.length} MongoDB servers:`);
    records.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name}:${r.port} (priority: ${r.priority})`);
    });
  } catch (err) {
    console.error('❌ DNS SRV resolution failed:', err.message);
    console.error('   This usually means:');
    console.error('   • MongoDB Atlas Network Access is blocking your IP');
    console.error('   • Cluster hostname is incorrect');
    console.error('   • DNS servers cannot reach Atlas');
    console.error('\n   Solutions:');
    console.error('   1. Go to MongoDB Atlas → Network Access');
    console.error('   2. Add IP Address: 0.0.0.0/0 (allows all IPs)');
    console.error('   3. Wait 2-3 minutes for propagation');
    console.error('   4. Try again');
    process.exit(1);
  }
} else {
  console.error('❌ Could not extract hostname from connection string');
  process.exit(1);
}

// 4. Test actual MongoDB connection
console.log('\n4️⃣ Testing MongoDB connection...');
try {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connection successful!');
  console.log(`   Database: ${mongoose.connection.name}`);
  console.log(`   Host: ${mongoose.connection.host}`);
  console.log(`   Ready state: ${mongoose.connection.readyState}`);
  
  // Test a simple operation
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`   Collections found: ${collections.length}`);
  
  await mongoose.connection.close();
  console.log('\n✅ All diagnostics passed! MongoDB connection is working.\n');
  process.exit(0);
} catch (err) {
  console.error('❌ MongoDB connection failed:', err.message);
  console.error('\n   Common causes:');
  console.error('   • Wrong username or password');
  console.error('   • Database user doesn\'t have access to the database');
  console.error('   • IP not whitelisted in Atlas Network Access');
  console.error('   • Connection string has typos');
  process.exit(1);
}
