import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PredefinedPuzzle } from './models/PredefinedPuzzle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/n-queens-game';

/**
 * Predefined Puzzle Library
 * 10 carefully designed puzzles with varying difficulties
 */
const puzzles = [
  // PUZZLE 1: 4x4 - Easy - First Steps
  {
    puzzleId: 'puzzle-001',
    puzzleName: 'First Steps',
    description: 'A simple 4×4 puzzle to get you started. Two queens are already placed. Can you position the remaining two?',
    n: 4,
    initialQueens: [
      { row: 0, col: 1 }, // Queen at (0,1)
      { row: 2, col: 0 }  // Queen at (2,0)
    ],
    solution: [
      { row: 0, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 0 },
      { row: 3, col: 2 }
    ],
    difficulty: 'easy',
    expectedMinTime: 30,
    maxHints: 3,
    tags: ['beginner', 'tutorial', '4x4'],
    category: 'beginner',
    order: 1,
    isActive: true
  },

  // PUZZLE 2: 4x4 - Easy - Corner Start
  {
    puzzleId: 'puzzle-002',
    puzzleName: 'Corner Start',
    description: 'Starting from the corners. One queen in each corner is placed. Find the middle positions!',
    n: 4,
    initialQueens: [
      { row: 0, col: 0 }, // Top-left corner
      { row: 3, col: 3 }  // Bottom-right corner
    ],
    solution: [
      { row: 0, col: 0 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
      { row: 3, col: 3 }
    ],
    difficulty: 'easy',
    expectedMinTime: 45,
    maxHints: 3,
    tags: ['beginner', 'corners', '4x4'],
    category: 'beginner',
    order: 2,
    isActive: true
  },

  // PUZZLE 3: 5x5 - Easy - Five Queens
  {
    puzzleId: 'puzzle-003',
    puzzleName: 'Five Queens Challenge',
    description: 'Step up to 5×5! Two queens are locked. Place the remaining three strategically.',
    n: 5,
    initialQueens: [
      { row: 0, col: 2 }, // Center of first row
      { row: 2, col: 0 }  // Left edge middle
    ],
    solution: [
      { row: 0, col: 2 },
      { row: 1, col: 4 },
      { row: 2, col: 0 },
      { row: 3, col: 3 },
      { row: 4, col: 1 }
    ],
    difficulty: 'easy',
    expectedMinTime: 60,
    maxHints: 3,
    tags: ['beginner', '5x5', 'intro'],
    category: 'beginner',
    order: 3,
    isActive: true
  },

  // PUZZLE 4: 5x5 - Medium - Diagonal Pattern
  {
    puzzleId: 'puzzle-004',
    puzzleName: 'Diagonal Dilemma',
    description: 'A tricky 5×5 puzzle with diagonal constraints. One queen placed. Think carefully!',
    n: 5,
    initialQueens: [
      { row: 1, col: 1 } // Near center
    ],
    solution: [
      { row: 0, col: 3 },
      { row: 1, col: 1 },
      { row: 2, col: 4 },
      { row: 3, col: 2 },
      { row: 4, col: 0 }
    ],
    difficulty: 'medium',
    expectedMinTime: 90,
    maxHints: 2,
    tags: ['intermediate', '5x5', 'diagonal'],
    category: 'intermediate',
    order: 4,
    isActive: true
  },

  // PUZZLE 5: 6x6 - Medium - Half Filled
  {
    puzzleId: 'puzzle-005',
    puzzleName: 'Half and Half',
    description: 'Three queens are already on the board. Complete the 6×6 puzzle with the remaining three.',
    n: 6,
    initialQueens: [
      { row: 0, col: 1 },
      { row: 2, col: 5 },
      { row: 4, col: 2 }
    ],
    solution: [
      { row: 0, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 5 },
      { row: 3, col: 0 },
      { row: 4, col: 2 },
      { row: 5, col: 4 }
    ],
    difficulty: 'medium',
    expectedMinTime: 120,
    maxHints: 2,
    tags: ['intermediate', '6x6', 'half-filled'],
    category: 'intermediate',
    order: 5,
    isActive: true
  },

  // PUZZLE 6: 6x6 - Medium - Edge Master
  {
    puzzleId: 'puzzle-006',
    puzzleName: 'Edge Master',
    description: 'All initial queens are on the edges. Navigate the center wisely!',
    n: 6,
    initialQueens: [
      { row: 0, col: 0 }, // Top-left
      { row: 5, col: 5 }  // Bottom-right
    ],
    solution: [
      { row: 0, col: 0 },
      { row: 1, col: 2 },
      { row: 2, col: 4 },
      { row: 3, col: 1 },
      { row: 4, col: 3 },
      { row: 5, col: 5 }
    ],
    difficulty: 'medium',
    expectedMinTime: 135,
    maxHints: 2,
    tags: ['intermediate', '6x6', 'edges'],
    category: 'intermediate',
    order: 6,
    isActive: true
  },

  // PUZZLE 7: 7x7 - Hard - Lucky Seven
  {
    puzzleId: 'puzzle-007',
    puzzleName: 'Lucky Seven',
    description: 'Your first 7×7 challenge! Two queens placed. This requires careful planning.',
    n: 7,
    initialQueens: [
      { row: 0, col: 3 },
      { row: 3, col: 0 }
    ],
    solution: [
      { row: 0, col: 3 },
      { row: 1, col: 5 },
      { row: 2, col: 1 },
      { row: 3, col: 0 },
      { row: 4, col: 6 },
      { row: 5, col: 2 },
      { row: 6, col: 4 }
    ],
    difficulty: 'hard',
    expectedMinTime: 180,
    maxHints: 2,
    tags: ['advanced', '7x7', 'challenge'],
    category: 'advanced',
    order: 7,
    isActive: true
  },

  // PUZZLE 8: 8x8 - Hard - Classic Eight
  {
    puzzleId: 'puzzle-008',
    puzzleName: 'Classic Eight',
    description: 'The classic 8×8 board! Three queens locked in place. Can you solve this iconic puzzle?',
    n: 8,
    initialQueens: [
      { row: 0, col: 4 },
      { row: 3, col: 1 },
      { row: 5, col: 7 }
    ],
    solution: [
      { row: 0, col: 4 },
      { row: 1, col: 6 },
      { row: 2, col: 0 },
      { row: 3, col: 1 },
      { row: 4, col: 3 },
      { row: 5, col: 7 },
      { row: 6, col: 5 },
      { row: 7, col: 2 }
    ],
    difficulty: 'hard',
    expectedMinTime: 240,
    maxHints: 1,
    tags: ['advanced', '8x8', 'classic'],
    category: 'advanced',
    order: 8,
    isActive: true
  },

  // PUZZLE 9: 8x8 - Expert - Minimal Clues
  {
    puzzleId: 'puzzle-009',
    puzzleName: 'Minimal Clues',
    description: 'Expert level! Only one queen placed on the 8×8 board. This is the ultimate test.',
    n: 8,
    initialQueens: [
      { row: 4, col: 4 } // Center position
    ],
    solution: [
      { row: 0, col: 0 },
      { row: 1, col: 6 },
      { row: 2, col: 3 },
      { row: 3, col: 1 },
      { row: 4, col: 4 },
      { row: 5, col: 7 },
      { row: 6, col: 5 },
      { row: 7, col: 2 }
    ],
    difficulty: 'expert',
    expectedMinTime: 300,
    maxHints: 1,
    tags: ['master', '8x8', 'expert', 'minimal'],
    category: 'master',
    order: 9,
    isActive: true
  },

  // PUZZLE 10: 8x8 - Expert - Corner Challenge
  {
    puzzleId: 'puzzle-010',
    puzzleName: 'Corner Challenge',
    description: 'Master level puzzle! Two opposite corner queens. Navigate the entire 8×8 board flawlessly.',
    n: 8,
    initialQueens: [
      { row: 0, col: 0 }, // Top-left
      { row: 7, col: 7 }  // Bottom-right
    ],
    solution: [
      { row: 0, col: 0 },
      { row: 1, col: 4 },
      { row: 2, col: 1 },
      { row: 3, col: 5 },
      { row: 4, col: 2 },
      { row: 5, col: 6 },
      { row: 6, col: 3 },
      { row: 7, col: 7 }
    ],
    difficulty: 'expert',
    expectedMinTime: 320,
    maxHints: 1,
    tags: ['master', '8x8', 'expert', 'corners'],
    category: 'master',
    order: 10,
    isActive: true
  }
];

/**
 * Seed the database with predefined puzzles
 */
async function seedPuzzles() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('Clearing existing predefined puzzles...');
    await PredefinedPuzzle.deleteMany({});
    console.log('✅ Cleared existing puzzles');

    console.log('Seeding predefined puzzles...');
    const result = await PredefinedPuzzle.insertMany(puzzles);
    console.log(`✅ Successfully seeded ${result.length} puzzles`);

    console.log('\n📋 Puzzle Summary:');
    console.log('─────────────────────────────────────────────');
    
    const summary = {
      easy: puzzles.filter(p => p.difficulty === 'easy').length,
      medium: puzzles.filter(p => p.difficulty === 'medium').length,
      hard: puzzles.filter(p => p.difficulty === 'hard').length,
      expert: puzzles.filter(p => p.difficulty === 'expert').length
    };
    
    console.log(`Easy:    ${summary.easy} puzzles (4×4 - 5×5)`);
    console.log(`Medium:  ${summary.medium} puzzles (5×5 - 6×6)`);
    console.log(`Hard:    ${summary.hard} puzzles (7×7 - 8×8)`);
    console.log(`Expert:  ${summary.expert} puzzles (8×8)`);
    console.log('─────────────────────────────────────────────');
    console.log(`Total:   ${puzzles.length} puzzles\n`);

    console.log('🎯 Puzzle List:');
    puzzles.forEach((puzzle, index) => {
      console.log(`${index + 1}. ${puzzle.puzzleName} (${puzzle.puzzleId})`);
      console.log(`   ${puzzle.n}×${puzzle.n} | ${puzzle.difficulty} | ${puzzle.initialQueens.length} queens locked | ~${puzzle.expectedMinTime}s`);
    });

    console.log('\n✅ Puzzle seeding completed successfully!');
    console.log('🎮 You can now access these puzzles via: GET /api/puzzles/predefined/list');
    
  } catch (error) {
    console.error('❌ Error seeding puzzles:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the seeder
seedPuzzles();
