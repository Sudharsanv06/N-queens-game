import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Achievement from '../models/Achievement.js'
import Badge from '../models/Badge.js'
import Milestone from '../models/Milestone.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

// ============================================
// ACHIEVEMENTS DATA (15+ achievements)
// ============================================

const achievements = [
  // ========== PROGRESS ACHIEVEMENTS (5) ==========
  {
    achievementId: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first N-Queens game',
    category: 'progress',
    icon: '🎯',
    requirementType: 'games_completed',
    requirementValue: 1,
    comparisonOperator: 'gte',
    rewardPoints: 50,
    rewardXP: 25,
    rewardBadgeId: null,
    isSecret: false,
    tier: 'bronze',
    sortOrder: 1
  },
  {
    achievementId: 'sharp_thinker',
    name: 'Sharp Thinker',
    description: 'Place 50 queens across all games',
    category: 'progress',
    icon: '👑',
    requirementType: 'queens_placed',
    requirementValue: 50,
    comparisonOperator: 'gte',
    rewardPoints: 100,
    rewardXP: 50,
    rewardBadgeId: 'bronze_solver',
    isSecret: false,
    tier: 'bronze',
    sortOrder: 2
  },
  {
    achievementId: 'strategic_mind',
    name: 'Strategic Mind',
    description: 'Complete 10 N-Queens games',
    category: 'progress',
    icon: '🧠',
    requirementType: 'games_completed',
    requirementValue: 10,
    comparisonOperator: 'gte',
    rewardPoints: 200,
    rewardXP: 100,
    rewardBadgeId: 'silver_solver',
    isSecret: false,
    tier: 'silver',
    sortOrder: 3
  },
  {
    achievementId: 'deep_solver',
    name: 'Deep Solver',
    description: 'Complete 20 N-Queens games',
    category: 'progress',
    icon: '🎓',
    requirementType: 'games_completed',
    requirementValue: 20,
    comparisonOperator: 'gte',
    rewardPoints: 300,
    rewardXP: 150,
    rewardBadgeId: 'gold_solver',
    isSecret: false,
    tier: 'gold',
    sortOrder: 4
  },
  {
    achievementId: 'grandmaster',
    name: 'Grandmaster',
    description: 'Complete 50 N-Queens games',
    category: 'progress',
    icon: '🏆',
    requirementType: 'games_completed',
    requirementValue: 50,
    comparisonOperator: 'gte',
    rewardPoints: 1000,
    rewardXP: 500,
    rewardBadgeId: 'grandmaster',
    isSecret: false,
    tier: 'platinum',
    sortOrder: 5
  },

  // ========== PERFORMANCE ACHIEVEMENTS (5) ==========
  {
    achievementId: 'speed_starter',
    name: 'Speed Starter',
    description: 'Complete a game in under 60 seconds',
    category: 'performance',
    icon: '⚡',
    requirementType: 'solve_time',
    requirementValue: 60,
    comparisonOperator: 'lte',
    rewardPoints: 150,
    rewardXP: 75,
    rewardBadgeId: 'bronze_speed',
    isSecret: false,
    tier: 'bronze',
    sortOrder: 10
  },
  {
    achievementId: 'lightning_solver',
    name: 'Lightning Solver',
    description: 'Complete a game in under 30 seconds',
    category: 'performance',
    icon: '⚡⚡',
    requirementType: 'solve_time',
    requirementValue: 30,
    comparisonOperator: 'lte',
    rewardPoints: 300,
    rewardXP: 150,
    rewardBadgeId: 'gold_speed',
    isSecret: false,
    tier: 'gold',
    sortOrder: 11
  },
  {
    achievementId: 'zero_hint_hero',
    name: 'Zero Hint Hero',
    description: 'Complete a game without using any hints',
    category: 'performance',
    icon: '🎯',
    requirementType: 'zero_hints',
    requirementValue: 1,
    comparisonOperator: 'gte',
    rewardPoints: 200,
    rewardXP: 100,
    rewardBadgeId: null,
    isSecret: false,
    tier: 'silver',
    sortOrder: 12
  },
  {
    achievementId: 'efficiency_pro',
    name: 'Efficiency Pro',
    description: 'Complete 5 games with zero hints',
    category: 'performance',
    icon: '💯',
    requirementType: 'zero_hints',
    requirementValue: 5,
    comparisonOperator: 'gte',
    rewardPoints: 400,
    rewardXP: 200,
    rewardBadgeId: 'efficiency_master',
    isSecret: false,
    tier: 'gold',
    sortOrder: 13
  },
  {
    achievementId: 'perfect_accuracy',
    name: 'Perfect Accuracy',
    description: 'Complete a game with perfect moves (no mistakes)',
    category: 'performance',
    icon: '✨',
    requirementType: 'perfect_solve',
    requirementValue: 1,
    comparisonOperator: 'gte',
    rewardPoints: 250,
    rewardXP: 125,
    rewardBadgeId: null,
    isSecret: false,
    tier: 'silver',
    sortOrder: 14
  },

  // ========== PUZZLE ACHIEVEMENTS (5) ==========
  {
    achievementId: 'puzzle_novice',
    name: 'Puzzle Novice',
    description: 'Solve 3 predefined puzzles',
    category: 'puzzle',
    icon: '🧩',
    requirementType: 'puzzles_completed',
    requirementValue: 3,
    comparisonOperator: 'gte',
    rewardPoints: 100,
    rewardXP: 50,
    rewardBadgeId: null,
    isSecret: false,
    tier: 'bronze',
    sortOrder: 20
  },
  {
    achievementId: 'puzzle_adept',
    name: 'Puzzle Adept',
    description: 'Solve 6 predefined puzzles',
    category: 'puzzle',
    icon: '🧩🧩',
    requirementType: 'puzzles_completed',
    requirementValue: 6,
    comparisonOperator: 'gte',
    rewardPoints: 200,
    rewardXP: 100,
    rewardBadgeId: 'puzzle_solver',
    isSecret: false,
    tier: 'silver',
    sortOrder: 21
  },
  {
    achievementId: 'puzzle_expert',
    name: 'Puzzle Expert',
    description: 'Solve all 10 predefined puzzles',
    category: 'puzzle',
    icon: '🧩🧩🧩',
    requirementType: 'puzzles_completed',
    requirementValue: 10,
    comparisonOperator: 'gte',
    rewardPoints: 500,
    rewardXP: 250,
    rewardBadgeId: 'puzzle_master',
    isSecret: false,
    tier: 'gold',
    sortOrder: 22
  },
  {
    achievementId: 'star_collector',
    name: 'Star Collector',
    description: 'Earn 15 stars from puzzle challenges',
    category: 'puzzle',
    icon: '⭐',
    requirementType: 'puzzle_stars',
    requirementValue: 15,
    comparisonOperator: 'gte',
    rewardPoints: 300,
    rewardXP: 150,
    rewardBadgeId: null,
    isSecret: false,
    tier: 'silver',
    sortOrder: 23
  },
  {
    achievementId: 'supreme_star_master',
    name: 'Supreme Star Master',
    description: 'Earn 30 stars from puzzle challenges',
    category: 'puzzle',
    icon: '🌟',
    requirementType: 'puzzle_stars',
    requirementValue: 30,
    comparisonOperator: 'gte',
    rewardPoints: 1000,
    rewardXP: 500,
    rewardBadgeId: 'star_champion',
    isSecret: false,
    tier: 'platinum',
    sortOrder: 24
  },

  // ========== SECRET/BONUS ACHIEVEMENTS (3) ==========
  {
    achievementId: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a game between midnight and 6 AM',
    category: 'progress',
    icon: '🦉',
    requirementType: 'games_completed',
    requirementValue: 1,
    comparisonOperator: 'gte',
    rewardPoints: 150,
    rewardXP: 75,
    rewardBadgeId: null,
    isSecret: true,
    tier: 'silver',
    sortOrder: 100
  },
  {
    achievementId: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play for 7 consecutive days',
    category: 'progress',
    icon: '📅',
    requirementType: 'streak_days',
    requirementValue: 7,
    comparisonOperator: 'gte',
    rewardPoints: 500,
    rewardXP: 250,
    rewardBadgeId: 'streak_master',
    isSecret: false,
    tier: 'gold',
    sortOrder: 101
  },
  {
    achievementId: 'marathon_player',
    name: 'Marathon Player',
    description: 'Make 500 total moves across all games',
    category: 'progress',
    icon: '🏃',
    requirementType: 'total_moves',
    requirementValue: 500,
    comparisonOperator: 'gte',
    rewardPoints: 300,
    rewardXP: 150,
    rewardBadgeId: null,
    isSecret: true,
    tier: 'silver',
    sortOrder: 102
  }
]

// ============================================
// BADGES DATA
// ============================================

const badges = [
  // Bronze Badges
  {
    badgeId: 'bronze_solver',
    name: 'Bronze Solver',
    description: 'Awarded for placing 50 queens',
    icon: '🥉',
    tier: 'bronze',
    category: 'progress',
    unlockCondition: {
      achievementId: 'sharp_thinker',
      description: 'Complete Sharp Thinker achievement'
    },
    rarity: 'common',
    sortOrder: 1
  },
  {
    badgeId: 'bronze_speed',
    name: 'Bronze Speedster',
    description: 'Awarded for solving under 60 seconds',
    icon: '🥉⚡',
    tier: 'bronze',
    category: 'performance',
    unlockCondition: {
      achievementId: 'speed_starter',
      description: 'Complete Speed Starter achievement'
    },
    rarity: 'common',
    sortOrder: 2
  },

  // Silver Badges
  {
    badgeId: 'silver_solver',
    name: 'Silver Solver',
    description: 'Awarded for completing 10 games',
    icon: '🥈',
    tier: 'silver',
    category: 'progress',
    unlockCondition: {
      achievementId: 'strategic_mind',
      description: 'Complete Strategic Mind achievement'
    },
    rarity: 'rare',
    sortOrder: 10
  },
  {
    badgeId: 'puzzle_solver',
    name: 'Puzzle Solver',
    description: 'Awarded for solving 6 puzzles',
    icon: '🥈🧩',
    tier: 'silver',
    category: 'puzzle',
    unlockCondition: {
      achievementId: 'puzzle_adept',
      description: 'Complete Puzzle Adept achievement'
    },
    rarity: 'rare',
    sortOrder: 11
  },

  // Gold Badges
  {
    badgeId: 'gold_solver',
    name: 'Gold Solver',
    description: 'Awarded for completing 20 games',
    icon: '🥇',
    tier: 'gold',
    category: 'progress',
    unlockCondition: {
      achievementId: 'deep_solver',
      description: 'Complete Deep Solver achievement'
    },
    rarity: 'epic',
    sortOrder: 20
  },
  {
    badgeId: 'gold_speed',
    name: 'Gold Speedster',
    description: 'Awarded for solving under 30 seconds',
    icon: '🥇⚡',
    tier: 'gold',
    category: 'performance',
    unlockCondition: {
      achievementId: 'lightning_solver',
      description: 'Complete Lightning Solver achievement'
    },
    rarity: 'epic',
    sortOrder: 21
  },
  {
    badgeId: 'puzzle_master',
    name: 'Puzzle Master',
    description: 'Awarded for solving all puzzles',
    icon: '🥇🧩',
    tier: 'gold',
    category: 'puzzle',
    unlockCondition: {
      achievementId: 'puzzle_expert',
      description: 'Complete Puzzle Expert achievement'
    },
    rarity: 'epic',
    sortOrder: 22
  },
  {
    badgeId: 'efficiency_master',
    name: 'Efficiency Master',
    description: 'Awarded for 5 zero-hint solves',
    icon: '🥇💯',
    tier: 'gold',
    category: 'performance',
    unlockCondition: {
      achievementId: 'efficiency_pro',
      description: 'Complete Efficiency Pro achievement'
    },
    rarity: 'epic',
    sortOrder: 23
  },
  {
    badgeId: 'streak_master',
    name: 'Streak Master',
    description: 'Awarded for 7-day play streak',
    icon: '🔥',
    tier: 'gold',
    category: 'special',
    unlockCondition: {
      achievementId: 'dedicated_player',
      description: 'Complete Dedicated Player achievement'
    },
    rarity: 'epic',
    sortOrder: 24
  },

  // Platinum Badges
  {
    badgeId: 'grandmaster',
    name: 'Grandmaster',
    description: 'Awarded for completing 50 games',
    icon: '💎',
    tier: 'platinum',
    category: 'progress',
    unlockCondition: {
      achievementId: 'grandmaster',
      description: 'Complete Grandmaster achievement'
    },
    rarity: 'legendary',
    sortOrder: 30
  },
  {
    badgeId: 'star_champion',
    name: 'Star Champion',
    description: 'Awarded for earning 30 stars',
    icon: '💎⭐',
    tier: 'platinum',
    category: 'puzzle',
    unlockCondition: {
      achievementId: 'supreme_star_master',
      description: 'Complete Supreme Star Master achievement'
    },
    rarity: 'legendary',
    sortOrder: 31
  }
]

// ============================================
// MILESTONES DATA
// ============================================

const milestones = [
  {
    milestoneId: 'level_5',
    name: 'Level 5 Reached',
    description: 'Reach player level 5',
    icon: '🎖️',
    triggerType: 'level',
    triggerValue: 5,
    rewardType: 'xp',
    rewardValue: {
      xp: 100,
      badgeId: null,
      points: 0
    },
    sortOrder: 1
  },
  {
    milestoneId: 'puzzles_25',
    name: '25 Puzzles Solved',
    description: 'Solve 25 puzzle challenges',
    icon: '🎖️🧩',
    triggerType: 'puzzles_solved',
    triggerValue: 25,
    rewardType: 'multiple',
    rewardValue: {
      xp: 250,
      badgeId: null,
      points: 500
    },
    sortOrder: 2
  },
  {
    milestoneId: 'queens_100',
    name: '100 Queens Placed',
    description: 'Place 100 queens across all games',
    icon: '👑👑👑',
    triggerType: 'queens_placed',
    triggerValue: 100,
    rewardType: 'xp',
    rewardValue: {
      xp: 200,
      badgeId: null,
      points: 0
    },
    sortOrder: 3
  },
  {
    milestoneId: 'moves_1000',
    name: '1000 Moves Made',
    description: 'Make 1000 total moves',
    icon: '🎖️🏃',
    triggerType: 'total_moves',
    triggerValue: 1000,
    rewardType: 'xp',
    rewardValue: {
      xp: 300,
      badgeId: null,
      points: 0
    },
    sortOrder: 4
  },
  {
    milestoneId: 'achievements_10',
    name: '10 Achievements Unlocked',
    description: 'Unlock 10 achievements',
    icon: '🏆🏆',
    triggerType: 'achievements_unlocked',
    triggerValue: 10,
    rewardType: 'multiple',
    rewardValue: {
      xp: 500,
      badgeId: null,
      points: 1000
    },
    sortOrder: 5
  }
]

// ============================================
// SEED FUNCTION
// ============================================

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nqueens')
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await Achievement.deleteMany({})
    await Badge.deleteMany({})
    await Milestone.deleteMany({})

    // Insert achievements
    console.log('📝 Inserting achievements...')
    const insertedAchievements = await Achievement.insertMany(achievements)
    console.log(`✅ Inserted ${insertedAchievements.length} achievements`)

    // Insert badges
    console.log('🛡️  Inserting badges...')
    const insertedBadges = await Badge.insertMany(badges)
    console.log(`✅ Inserted ${insertedBadges.length} badges`)

    // Insert milestones
    console.log('🎖️  Inserting milestones...')
    const insertedMilestones = await Milestone.insertMany(milestones)
    console.log(`✅ Inserted ${insertedMilestones.length} milestones`)

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Achievements: ${insertedAchievements.length}`)
    console.log(`   - Badges: ${insertedBadges.length}`)
    console.log(`   - Milestones: ${insertedMilestones.length}`)

    // Display achievements by category
    console.log('\n🏆 Achievements by Category:')
    const progressCount = achievements.filter(a => a.category === 'progress').length
    const performanceCount = achievements.filter(a => a.category === 'performance').length
    const puzzleCount = achievements.filter(a => a.category === 'puzzle').length
    console.log(`   - Progress: ${progressCount}`)
    console.log(`   - Performance: ${performanceCount}`)
    console.log(`   - Puzzle: ${puzzleCount}`)

    // Display badges by tier
    console.log('\n🛡️  Badges by Tier:')
    const bronzeCount = badges.filter(b => b.tier === 'bronze').length
    const silverCount = badges.filter(b => b.tier === 'silver').length
    const goldCount = badges.filter(b => b.tier === 'gold').length
    const platinumCount = badges.filter(b => b.tier === 'platinum').length
    console.log(`   - Bronze: ${bronzeCount}`)
    console.log(`   - Silver: ${silverCount}`)
    console.log(`   - Gold: ${goldCount}`)
    console.log(`   - Platinum: ${platinumCount}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seed
seedDatabase()
