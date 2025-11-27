import { PredefinedPuzzle, PuzzleAttempt } from '../models/PredefinedPuzzle.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Get list of all active puzzles
 */
export const getPuzzleList = async (req, res) => {
  try {
    const { difficulty, category, n } = req.query;
    
    const filter = { isActive: true };
    
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (n) filter.n = parseInt(n);
    
    const puzzles = await PredefinedPuzzle.find(filter)
      .sort({ order: 1, difficulty: 1, n: 1 })
      .select('-solution') // Don't send solution to client
      .lean();
    
    // If user is authenticated, include their progress
    if (req.user) {
      const userAttempts = await PuzzleAttempt.find({
        userId: req.user.id,
        puzzleId: { $in: puzzles.map(p => p.puzzleId) },
        solved: true
      }).select('puzzleId timeTaken stars').lean();
      
      const attemptMap = {};
      userAttempts.forEach(attempt => {
        if (!attemptMap[attempt.puzzleId] || attempt.timeTaken < attemptMap[attempt.puzzleId].timeTaken) {
          attemptMap[attempt.puzzleId] = {
            bestTime: attempt.timeTaken,
            bestStars: attempt.stars
          };
        }
      });
      
      puzzles.forEach(puzzle => {
        if (attemptMap[puzzle.puzzleId]) {
          puzzle.userProgress = attemptMap[puzzle.puzzleId];
          puzzle.completed = true;
        } else {
          puzzle.completed = false;
        }
      });
    }
    
    res.json({
      success: true,
      puzzles,
      total: puzzles.length
    });
  } catch (error) {
    console.error('Get puzzle list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch puzzles',
      error: error.message
    });
  }
};

/**
 * Get single puzzle by ID
 */
export const getPuzzleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const puzzle = await PredefinedPuzzle.findOne({ 
      puzzleId: id,
      isActive: true 
    }).select('-solution').lean();
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }
    
    // If user is authenticated, include their progress
    if (req.user) {
      const userAttempts = await PuzzleAttempt.find({
        userId: req.user.id,
        puzzleId: id
      }).sort({ createdAt: -1 }).limit(5).lean();
      
      puzzle.userAttempts = userAttempts;
      
      const bestAttempt = await PuzzleAttempt.findOne({
        userId: req.user.id,
        puzzleId: id,
        solved: true
      }).sort({ timeTaken: 1 }).lean();
      
      if (bestAttempt) {
        puzzle.userBest = {
          time: bestAttempt.timeTaken,
          stars: bestAttempt.stars,
          moves: bestAttempt.movesUsed,
          hints: bestAttempt.hintsUsed
        };
      }
    }
    
    res.json({
      success: true,
      puzzle
    });
  } catch (error) {
    console.error('Get puzzle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch puzzle',
      error: error.message
    });
  }
};

/**
 * Start a puzzle attempt
 */
export const startPuzzleAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if puzzle exists
    const puzzle = await PredefinedPuzzle.findOne({ 
      puzzleId: id,
      isActive: true 
    });
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }
    
    // Check for existing in-progress attempt
    const existingAttempt = await PuzzleAttempt.findOne({
      userId,
      puzzleId: id,
      status: 'in_progress'
    });
    
    if (existingAttempt) {
      // Return existing attempt
      return res.json({
        success: true,
        message: 'Resumed existing attempt',
        attempt: existingAttempt,
        puzzle: {
          puzzleId: puzzle.puzzleId,
          puzzleName: puzzle.puzzleName,
          n: puzzle.n,
          initialQueens: puzzle.initialQueens,
          difficulty: puzzle.difficulty,
          expectedMinTime: puzzle.expectedMinTime,
          maxHints: puzzle.maxHints
        }
      });
    }
    
    // Create new attempt
    const attempt = new PuzzleAttempt({
      userId,
      puzzleId: id,
      startTime: new Date(),
      boardState: {
        queens: [...puzzle.initialQueens],
        lockedQueens: [...puzzle.initialQueens]
      }
    });
    
    await attempt.save();
    
    // Increment puzzle attempt stats
    puzzle.stats.totalAttempts += 1;
    await puzzle.save();
    
    res.json({
      success: true,
      message: 'Puzzle attempt started',
      attempt,
      puzzle: {
        puzzleId: puzzle.puzzleId,
        puzzleName: puzzle.puzzleName,
        n: puzzle.n,
        initialQueens: puzzle.initialQueens,
        difficulty: puzzle.difficulty,
        expectedMinTime: puzzle.expectedMinTime,
        maxHints: puzzle.maxHints
      }
    });
  } catch (error) {
    console.error('Start puzzle attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start puzzle attempt',
      error: error.message
    });
  }
};

/**
 * Complete a puzzle attempt
 */
export const completePuzzleAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { solved, movesUsed, hintsUsed, timeTaken, boardState } = req.body;
    
    // Get puzzle
    const puzzle = await PredefinedPuzzle.findOne({ 
      puzzleId: id,
      isActive: true 
    });
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      });
    }
    
    // Find in-progress attempt
    let attempt = await PuzzleAttempt.findOne({
      userId,
      puzzleId: id,
      status: 'in_progress'
    });
    
    if (!attempt) {
      // Create attempt if doesn't exist (edge case)
      attempt = new PuzzleAttempt({
        userId,
        puzzleId: id,
        startTime: new Date(Date.now() - timeTaken * 1000)
      });
    }
    
    // Update attempt
    attempt.endTime = new Date();
    attempt.timeTaken = timeTaken || Math.floor((attempt.endTime - attempt.startTime) / 1000);
    attempt.solved = solved;
    attempt.movesUsed = movesUsed || 0;
    attempt.hintsUsed = hintsUsed || 0;
    attempt.boardState = boardState || attempt.boardState;
    attempt.status = solved ? 'completed' : 'gave_up';
    
    // Calculate stars if solved
    if (solved) {
      attempt.stars = attempt.calculateStars(puzzle.expectedMinTime);
      attempt.performance = attempt.calculatePerformance();
      
      // Update puzzle stats
      await puzzle.recordAttempt(true, attempt.timeTaken, attempt.stars);
      
      // Update user stats
      const user = await User.findById(userId);
      if (user) {
        user.stats.totalGames += 1;
        user.stats.totalScore += attempt.stars * 100;
        
        // Update fastest solve time if applicable
        if (!user.stats.fastestSolveTime || attempt.timeTaken < user.stats.fastestSolveTime) {
          user.stats.fastestSolveTime = attempt.timeTaken;
        }
        
        // Update highest board solved
        if (!user.stats.highestBoardSizeSolved || puzzle.n > user.stats.highestBoardSizeSolved) {
          user.stats.highestBoardSizeSolved = puzzle.n;
        }
        
        await user.save();
      }
    } else {
      await puzzle.recordAttempt(false, 0, 0);
    }
    
    await attempt.save();
    
    res.json({
      success: true,
      message: solved ? 'Puzzle completed!' : 'Puzzle attempt ended',
      attempt,
      puzzle: {
        puzzleId: puzzle.puzzleId,
        puzzleName: puzzle.puzzleName,
        expectedMinTime: puzzle.expectedMinTime
      }
    });
  } catch (error) {
    console.error('Complete puzzle attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete puzzle attempt',
      error: error.message
    });
  }
};

/**
 * Get user's puzzle attempts
 */
export const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { puzzleId, status, limit = 20, skip = 0 } = req.query;
    
    const filter = { userId };
    if (puzzleId) filter.puzzleId = puzzleId;
    if (status) filter.status = status;
    
    const attempts = await PuzzleAttempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    // Enrich with puzzle data
    const puzzleIds = [...new Set(attempts.map(a => a.puzzleId))];
    const puzzles = await PredefinedPuzzle.find({
      puzzleId: { $in: puzzleIds }
    }).select('puzzleId puzzleName n difficulty').lean();
    
    const puzzleMap = {};
    puzzles.forEach(p => {
      puzzleMap[p.puzzleId] = p;
    });
    
    attempts.forEach(attempt => {
      if (puzzleMap[attempt.puzzleId]) {
        attempt.puzzle = puzzleMap[attempt.puzzleId];
      }
    });
    
    const total = await PuzzleAttempt.countDocuments(filter);
    
    res.json({
      success: true,
      attempts,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempts',
      error: error.message
    });
  }
};

/**
 * Get user's puzzle progress summary
 */
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all puzzles
    const allPuzzles = await PredefinedPuzzle.find({ isActive: true })
      .select('puzzleId difficulty n')
      .lean();
    
    // Get user's completed attempts
    const completedAttempts = await PuzzleAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          solved: true
        }
      },
      {
        $group: {
          _id: '$puzzleId',
          bestTime: { $min: '$timeTaken' },
          bestStars: { $max: '$stars' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);
    
    // All attempts (including incomplete)
    const allAttempts = await PuzzleAttempt.find({ userId })
      .select('puzzleId timeTaken solved stars')
      .lean();
    
    // Build progress map
    const progressMap = {};
    completedAttempts.forEach(attempt => {
      progressMap[attempt._id] = {
        completed: true,
        bestTime: attempt.bestTime,
        bestStars: attempt.bestStars,
        attempts: attempt.totalAttempts
      };
    });
    
    // Calculate statistics
    const totalPuzzles = allPuzzles.length;
    const completedPuzzles = completedAttempts.length;
    const completionRate = totalPuzzles > 0 ? ((completedPuzzles / totalPuzzles) * 100).toFixed(1) : 0;
    
    const totalStars = completedAttempts.reduce((sum, a) => sum + (a.bestStars || 0), 0);
    const maxStars = completedPuzzles * 3;
    const averageStars = completedPuzzles > 0 ? (totalStars / completedPuzzles).toFixed(2) : 0;
    
    const averageTime = completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((sum, a) => sum + a.bestTime, 0) / completedAttempts.length)
      : 0;
    
    // Breakdown by difficulty
    const byDifficulty = {
      easy: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      hard: { total: 0, completed: 0 },
      expert: { total: 0, completed: 0 }
    };
    
    allPuzzles.forEach(puzzle => {
      if (byDifficulty[puzzle.difficulty]) {
        byDifficulty[puzzle.difficulty].total += 1;
        if (progressMap[puzzle.puzzleId]?.completed) {
          byDifficulty[puzzle.difficulty].completed += 1;
        }
      }
    });
    
    // Recent activity
    const recentAttempts = await PuzzleAttempt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('puzzleId timeTaken solved stars createdAt')
      .lean();
    
    // Enrich recent attempts with puzzle names
    const recentPuzzleIds = recentAttempts.map(a => a.puzzleId);
    const recentPuzzles = await PredefinedPuzzle.find({
      puzzleId: { $in: recentPuzzleIds }
    }).select('puzzleId puzzleName difficulty n').lean();
    
    const recentPuzzleMap = {};
    recentPuzzles.forEach(p => {
      recentPuzzleMap[p.puzzleId] = p;
    });
    
    recentAttempts.forEach(attempt => {
      if (recentPuzzleMap[attempt.puzzleId]) {
        attempt.puzzle = recentPuzzleMap[attempt.puzzleId];
      }
    });
    
    res.json({
      success: true,
      progress: {
        overview: {
          totalPuzzles,
          completedPuzzles,
          completionRate: parseFloat(completionRate),
          totalStars,
          maxStars,
          averageStars: parseFloat(averageStars),
          averageTime,
          totalAttempts: allAttempts.length
        },
        byDifficulty,
        recentAttempts,
        puzzleProgress: progressMap
      }
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

export default {
  getPuzzleList,
  getPuzzleById,
  startPuzzleAttempt,
  completePuzzleAttempt,
  getUserAttempts,
  getUserProgress
};
