import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import GameSave from './models/GameSave.js';
import Session from './models/Session.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const sampleSaves = [
  {
    sessionId: 'seed-session-001',
    n: 8,
    boardState: [
      [1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0]
    ],
    moves: [
      { row: 0, col: 0, action: 'place', timestamp: new Date('2025-11-26T10:00:00Z') },
      { row: 1, col: 4, action: 'place', timestamp: new Date('2025-11-26T10:01:00Z') },
      { row: 2, col: 7, action: 'place', timestamp: new Date('2025-11-26T10:02:00Z') },
      { row: 3, col: 5, action: 'place', timestamp: new Date('2025-11-26T10:03:00Z') },
      { row: 4, col: 2, action: 'place', timestamp: new Date('2025-11-26T10:04:00Z') },
      { row: 5, col: 6, action: 'place', timestamp: new Date('2025-11-26T10:05:00Z') },
      { row: 6, col: 1, action: 'place', timestamp: new Date('2025-11-26T10:06:00Z') },
      { row: 7, col: 3, action: 'place', timestamp: new Date('2025-11-26T10:07:00Z') }
    ],
    placedQueens: 8,
    timer: 420000,
    hintsUsed: 2,
    lastUpdated: new Date('2025-11-26T10:07:00Z'),
    metadata: {
      device: 'desktop',
      appVersion: '1.0.0',
      platform: 'Win32'
    }
  },
  {
    sessionId: 'seed-session-002',
    n: 10,
    boardState: Array(10).fill(null).map(() => Array(10).fill(0)),
    moves: [],
    placedQueens: 0,
    timer: 0,
    hintsUsed: 0,
    lastUpdated: new Date(),
    metadata: {
      device: 'mobile',
      appVersion: '1.0.0',
      platform: 'iOS'
    }
  },
  {
    sessionId: 'seed-session-003',
    n: 12,
    boardState: Array(12).fill(null).map(() => Array(12).fill(0)),
    moves: [
      { row: 0, col: 0, action: 'place', timestamp: new Date() },
      { row: 0, col: 0, action: 'remove', timestamp: new Date() },
      { row: 1, col: 2, action: 'place', timestamp: new Date() }
    ],
    placedQueens: 1,
    timer: 15000,
    hintsUsed: 1,
    lastUpdated: new Date(),
    metadata: {
      device: 'tablet',
      appVersion: '1.0.0',
      platform: 'Android'
    }
  }
];

const sampleSessions = [
  {
    sessionId: 'seed-session-001',
    n: 8,
    startAt: new Date('2025-11-26T10:00:00Z'),
    endAt: new Date('2025-11-26T10:07:00Z'),
    movesCount: 8,
    hintsUsed: 2,
    completed: true,
    analytics: {
      totalTime: 420000,
      averageMoveTime: 52500,
      wrongMoves: 0,
      correctMoves: 8,
      pauseCount: 1
    },
    metadata: {
      device: 'desktop',
      appVersion: '1.0.0',
      platform: 'Win32'
    }
  },
  {
    sessionId: 'seed-session-002',
    n: 10,
    startAt: new Date(),
    endAt: null,
    movesCount: 0,
    hintsUsed: 0,
    completed: false,
    analytics: {
      totalTime: 0,
      averageMoveTime: 0,
      wrongMoves: 0,
      correctMoves: 0,
      pauseCount: 0
    }
  },
  {
    sessionId: 'seed-session-003',
    n: 12,
    startAt: new Date(),
    endAt: null,
    movesCount: 3,
    hintsUsed: 1,
    completed: false,
    analytics: {
      totalTime: 15000,
      averageMoveTime: 5000,
      wrongMoves: 1,
      correctMoves: 2,
      pauseCount: 0
    }
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nqueens');
    console.log('Connected successfully!');

    console.log('\nClearing existing test data...');
    await GameSave.deleteMany({ sessionId: /^seed-session-/ });
    await Session.deleteMany({ sessionId: /^seed-session-/ });
    console.log('Cleared existing seed data');

    console.log('\nCreating sample game saves...');
    const createdSaves = await GameSave.insertMany(sampleSaves);
    console.log(`✓ Created ${createdSaves.length} game saves`);

    console.log('\nCreating sample sessions...');
    const createdSessions = await Session.insertMany(sampleSessions);
    console.log(`✓ Created ${createdSessions.length} sessions`);

    console.log('\n=== Seed Data Summary ===');
    console.log(`Total Game Saves: ${await GameSave.countDocuments()}`);
    console.log(`Total Sessions: ${await Session.countDocuments()}`);
    console.log(`Total Users: ${await User.countDocuments()}`);

    console.log('\n=== Sample Save IDs (for testing) ===');
    createdSaves.forEach((save, index) => {
      console.log(`${index + 1}. SessionID: ${save.sessionId}, SaveID: ${save._id}`);
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\nYou can now test the API with these session IDs:');
    console.log('- seed-session-001 (completed 8x8 game)');
    console.log('- seed-session-002 (new 10x10 game)');
    console.log('- seed-session-003 (in-progress 12x12 game)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}

export default seedDatabase;
