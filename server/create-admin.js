// Script to create an admin user for testing analytics dashboard
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create admin user data for localStorage (since we're using OfflineAuth)
async function createAdminUser() {
  const adminUser = {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@nqueens.game',
    password: await bcrypt.hash('admin123', 10),
    isAdmin: true,
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      bestTimes: {},
      streak: 0,
      levelCompletions: 0,
      totalScore: 0
    },
    createdAt: new Date().toISOString()
  };

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: adminUser.id, 
      email: adminUser.email, 
      isAdmin: adminUser.isAdmin 
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '30d' }
  );

  console.log('Admin User Created:');
  console.log('Email: admin@nqueens.game');
  console.log('Password: admin123');
  console.log('\nTo set up admin access in localStorage:');
  console.log('1. Open browser console');
  console.log('2. Run these commands:');
  console.log(`localStorage.setItem('token', '${token}');`);
  console.log(`localStorage.setItem('user', '${JSON.stringify(adminUser)}');`);
  console.log('3. Refresh the page');
  console.log('4. Navigate to /analytics');
  
  return { adminUser, token };
}

createAdminUser().catch(console.error);