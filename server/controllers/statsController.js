import User from '../models/User.js';
import GameSave from '../models/GameSave.js';
import Session from '../models/Session.js';

/**
 * Get user statistics dashboard
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data
    const user = await User.findById(userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Get last 14 days for games played per day
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    // Aggregate games played by day (last 14 days)
    const gamesPerDay = await GameSave.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: fourteenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          games: "$count",
          _id: 0
        }
      }
    ]);
    
    // Aggregate board sizes played
    const boardSizeDistribution = await GameSave.aggregate([
      {
        $match: { userId: user._id }
      },
      {
        $group: {
          _id: "$n",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          size: "$_id",
          games: "$count",
          _id: 0
        }
      }
    ]);
    
    // Aggregate time spent solving (grouped by board size)
    const timeByBoardSize = await GameSave.aggregate([
      {
        $match: { 
          userId: user._id,
          timer: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$n",
          averageTime: { $avg: "$timer" },
          totalTime: { $sum: "$timer" },
          games: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          size: "$_id",
          averageTime: { $round: ["$averageTime", 2] },
          totalTime: { $round: ["$totalTime", 2] },
          games: 1,
          _id: 0
        }
      }
    ]);
    
    // Get recent games
    const recentGames = await GameSave.find({ userId: user._id })
      .sort({ lastUpdated: -1 })
      .limit(10)
      .select('n timer hintsUsed placedQueens lastUpdated')
      .lean();
    
    // Calculate additional stats
    const totalGames = await GameSave.countDocuments({ userId: user._id });
    
    const fastestGame = await GameSave.findOne({ 
      userId: user._id,
      timer: { $gt: 0 }
    })
      .sort({ timer: 1 })
      .select('n timer')
      .lean();
    
    const highestBoardSize = await GameSave.findOne({ userId: user._id })
      .sort({ n: -1 })
      .select('n')
      .lean();
    
    const totalTimeSpent = await GameSave.aggregate([
      {
        $match: { userId: user._id }
      },
      {
        $group: {
          _id: null,
          totalTime: { $sum: "$timer" }
        }
      }
    ]);
    
    const averageSolveTime = totalGames > 0 && totalTimeSpent.length > 0
      ? Math.round(totalTimeSpent[0].totalTime / totalGames)
      : 0;
    
    const totalHintsUsed = await GameSave.aggregate([
      {
        $match: { userId: user._id }
      },
      {
        $group: {
          _id: null,
          totalHints: { $sum: "$hintsUsed" }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        overview: {
          totalGames,
          fastestTime: fastestGame ? fastestGame.timer : null,
          fastestBoardSize: fastestGame ? fastestGame.n : null,
          highestBoardSize: highestBoardSize ? highestBoardSize.n : 0,
          averageSolveTime,
          totalTimeSpent: totalTimeSpent.length > 0 ? totalTimeSpent[0].totalTime : 0,
          totalHintsUsed: totalHintsUsed.length > 0 ? totalHintsUsed[0].totalHints : 0,
          accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          lastLogin: user.lastLogin
        },
        charts: {
          gamesPerDay,
          boardSizeDistribution,
          timeByBoardSize
        },
        recentGames,
        userStats: user.stats
      }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get global statistics
 */
export const getGlobalStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await GameSave.countDocuments();
    
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const averageGamesPerUser = totalUsers > 0 ? Math.round(totalGames / totalUsers) : 0;
    
    // Most popular board size
    const popularBoardSize = await GameSave.aggregate([
      {
        $group: {
          _id: "$n",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalGames,
        averageGamesPerUser,
        mostPopularBoardSize: popularBoardSize.length > 0 ? popularBoardSize[0]._id : null
      }
    });
    
  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch global statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getUserStats,
  getGlobalStats
};
