import User from '../models/User.js';
import GameSave from '../models/GameSave.js';

/**
 * Get leaderboard - fastest solvers
 */
export const getFastestSolvers = async (req, res) => {
  try {
    const { boardSize, limit = 20 } = req.query;
    const currentUserId = req.user?.id;
    
    const matchStage = {
      timer: { $gt: 0 },
      userId: { $ne: null }
    };
    
    if (boardSize) {
      matchStage.n = parseInt(boardSize);
    }
    
    // Get fastest times with user details
    const leaderboard = await GameSave.aggregate([
      {
        $match: matchStage
      },
      {
        $sort: { timer: 1 }
      },
      {
        $group: {
          _id: "$userId",
          fastestTime: { $first: "$timer" },
          boardSize: { $first: "$n" },
          gameId: { $first: "$_id" },
          date: { $first: "$lastUpdated" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          userId: "$_id",
          username: "$user.username",
          name: "$user.name",
          avatar: "$user.avatar",
          fastestTime: 1,
          boardSize: 1,
          date: 1,
          _id: 0
        }
      },
      {
        $sort: { fastestTime: 1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    // Add ranking
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: currentUserId && entry.userId.toString() === currentUserId
    }));
    
    // Get current user's rank if not in top list
    let currentUserRank = null;
    if (currentUserId) {
      const userInList = rankedLeaderboard.find(entry => entry.isCurrentUser);
      
      if (!userInList) {
        const userFastestGame = await GameSave.findOne({
          userId: currentUserId,
          timer: { $gt: 0 },
          ...(boardSize && { n: parseInt(boardSize) })
        })
          .sort({ timer: 1 })
          .select('timer n')
          .lean();
        
        if (userFastestGame) {
          const betterTimes = await GameSave.aggregate([
            {
              $match: {
                timer: { $gt: 0, $lt: userFastestGame.timer },
                userId: { $ne: null },
                ...(boardSize && { n: parseInt(boardSize) })
              }
            },
            {
              $group: {
                _id: "$userId"
              }
            },
            {
              $count: "count"
            }
          ]);
          
          currentUserRank = {
            rank: betterTimes.length > 0 ? betterTimes[0].count + 1 : 1,
            fastestTime: userFastestGame.timer,
            boardSize: userFastestGame.n
          };
        }
      }
    }
    
    res.status(200).json({
      success: true,
      leaderboard: rankedLeaderboard,
      currentUserRank,
      boardSize: boardSize ? parseInt(boardSize) : 'all'
    });
    
  } catch (error) {
    console.error('Get fastest solvers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get leaderboard - highest board sizes solved
 */
export const getHighestBoardSizes = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const currentUserId = req.user?.id;
    
    // Get users with their highest board size
    const leaderboard = await GameSave.aggregate([
      {
        $match: {
          userId: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$userId",
          highestBoardSize: { $max: "$n" },
          totalGames: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          userId: "$_id",
          username: "$user.username",
          name: "$user.name",
          avatar: "$user.avatar",
          highestBoardSize: 1,
          totalGames: 1,
          _id: 0
        }
      },
      {
        $sort: { highestBoardSize: -1, totalGames: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    // Add ranking
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: currentUserId && entry.userId.toString() === currentUserId
    }));
    
    // Get current user's rank if not in top list
    let currentUserRank = null;
    if (currentUserId) {
      const userInList = rankedLeaderboard.find(entry => entry.isCurrentUser);
      
      if (!userInList) {
        const userHighestGame = await GameSave.findOne({ userId: currentUserId })
          .sort({ n: -1 })
          .select('n')
          .lean();
        
        if (userHighestGame) {
          const betterPlayers = await GameSave.aggregate([
            {
              $match: {
                userId: { $ne: null }
              }
            },
            {
              $group: {
                _id: "$userId",
                highestBoardSize: { $max: "$n" }
              }
            },
            {
              $match: {
                highestBoardSize: { $gt: userHighestGame.n }
              }
            },
            {
              $count: "count"
            }
          ]);
          
          currentUserRank = {
            rank: betterPlayers.length > 0 ? betterPlayers[0].count + 1 : 1,
            highestBoardSize: userHighestGame.n
          };
        }
      }
    }
    
    res.status(200).json({
      success: true,
      leaderboard: rankedLeaderboard,
      currentUserRank
    });
    
  } catch (error) {
    console.error('Get highest board sizes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get leaderboard - most games played
 */
export const getMostGamesPlayed = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const currentUserId = req.user?.id;
    
    const leaderboard = await User.aggregate([
      {
        $match: {
          'stats.totalGames': { $gt: 0 }
        }
      },
      {
        $project: {
          username: 1,
          name: 1,
          avatar: 1,
          totalGames: '$stats.totalGames',
          totalScore: '$stats.totalScore',
          level: 1
        }
      },
      {
        $sort: { totalGames: -1, totalScore: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    // Add ranking
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      userId: entry._id,
      rank: index + 1,
      isCurrentUser: currentUserId && entry._id.toString() === currentUserId,
      _id: undefined
    }));
    
    // Get current user's rank if not in top list
    let currentUserRank = null;
    if (currentUserId) {
      const userInList = rankedLeaderboard.find(entry => entry.isCurrentUser);
      
      if (!userInList) {
        const user = await User.findById(currentUserId).select('stats.totalGames');
        
        if (user && user.stats.totalGames > 0) {
          const betterPlayers = await User.countDocuments({
            'stats.totalGames': { $gt: user.stats.totalGames }
          });
          
          currentUserRank = {
            rank: betterPlayers + 1,
            totalGames: user.stats.totalGames
          };
        }
      }
    }
    
    res.status(200).json({
      success: true,
      leaderboard: rankedLeaderboard,
      currentUserRank
    });
    
  } catch (error) {
    console.error('Get most games played error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getFastestSolvers,
  getHighestBoardSizes,
  getMostGamesPlayed
};
