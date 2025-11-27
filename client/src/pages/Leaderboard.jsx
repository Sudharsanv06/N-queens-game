import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFastestSolvers,
  getHighestBoardSizes,
  getMostGamesPlayed,
  setActiveCategory
} from '../store/slices/leaderboardSlice';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, TrendingUp, Crown, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const { fastestSolvers, highestBoardSizes, mostGamesPlayed, currentUserRank, loading, activeCategory } = useSelector(
    (state) => state.leaderboard
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [selectedBoardSize, setSelectedBoardSize] = useState('');
  
  useEffect(() => {
    loadLeaderboard();
  }, [activeCategory, selectedBoardSize]);
  
  const loadLeaderboard = () => {
    switch (activeCategory) {
      case 'fastest':
        dispatch(getFastestSolvers({ boardSize: selectedBoardSize, limit: 20 }));
        break;
      case 'highest-board':
        dispatch(getHighestBoardSizes({ limit: 20 }));
        break;
      case 'most-games':
        dispatch(getMostGamesPlayed({ limit: 20 }));
        break;
      default:
        break;
    }
  };
  
  const getActiveData = () => {
    switch (activeCategory) {
      case 'fastest':
        return fastestSolvers;
      case 'highest-board':
        return highestBoardSizes;
      case 'most-games':
        return mostGamesPlayed;
      default:
        return [];
    }
  };
  
  const categories = [
    { id: 'fastest', label: 'Fastest Solvers', icon: <Zap /> },
    { id: 'highest-board', label: 'Highest Boards', icon: <Target /> },
    { id: 'most-games', label: 'Most Games', icon: <TrendingUp /> }
  ];
  
  const leaderboardData = getActiveData();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Global Leaderboard
          </h1>
          <p className="text-gray-600">Compete with the best N-Queens players worldwide</p>
        </motion.div>
        
        {/* Category Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => dispatch(setActiveCategory(category.id))}
              className={`flex-1 min-w-[140px] flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </div>
        
        {/* Board Size Filter (for fastest solvers) */}
        {activeCategory === 'fastest' && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Board Size</label>
            <select
              value={selectedBoardSize}
              onChange={(e) => setSelectedBoardSize(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">All Sizes</option>
              {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((size) => (
                <option key={size} value={size}>
                  {size}×{size}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Current User Rank (if not in top 20) */}
        {isAuthenticated && currentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-6 border-2 border-purple-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Your Rank</p>
                <p className="text-2xl font-bold text-purple-900">#{currentUserRank.rank}</p>
              </div>
              <div className="text-right">
                {activeCategory === 'fastest' && (
                  <>
                    <p className="text-sm text-purple-700">Fastest Time</p>
                    <p className="font-semibold text-purple-900">{formatTime(currentUserRank.fastestTime)}</p>
                    {currentUserRank.boardSize && (
                      <p className="text-xs text-purple-600">{currentUserRank.boardSize}×{currentUserRank.boardSize}</p>
                    )}
                  </>
                )}
                {activeCategory === 'highest-board' && (
                  <>
                    <p className="text-sm text-purple-700">Highest Board</p>
                    <p className="font-semibold text-purple-900">
                      {currentUserRank.highestBoardSize}×{currentUserRank.highestBoardSize}
                    </p>
                  </>
                )}
                {activeCategory === 'most-games' && (
                  <>
                    <p className="text-sm text-purple-700">Total Games</p>
                    <p className="font-semibold text-purple-900">{currentUserRank.totalGames}</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : leaderboardData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Player</th>
                    {activeCategory === 'fastest' && (
                      <>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Time</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Board</th>
                      </>
                    )}
                    {activeCategory === 'highest-board' && (
                      <>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Highest Board</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total Games</th>
                      </>
                    )}
                    {activeCategory === 'most-games' && (
                      <>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Games Played</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Level</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${
                        entry.isCurrentUser ? 'bg-purple-100/50' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(entry.rank)}
                          <span className="font-bold text-gray-800">#{entry.rank}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {entry.username}
                            {entry.isCurrentUser && (
                              <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{entry.name}</p>
                        </div>
                      </td>
                      {activeCategory === 'fastest' && (
                        <>
                          <td className="py-4 px-6 font-semibold text-purple-700">
                            {formatTime(entry.fastestTime)}
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {entry.boardSize}×{entry.boardSize}
                          </td>
                        </>
                      )}
                      {activeCategory === 'highest-board' && (
                        <>
                          <td className="py-4 px-6 font-semibold text-purple-700">
                            {entry.highestBoardSize}×{entry.highestBoardSize}
                          </td>
                          <td className="py-4 px-6 text-gray-600">{entry.totalGames}</td>
                        </>
                      )}
                      {activeCategory === 'most-games' && (
                        <>
                          <td className="py-4 px-6 font-semibold text-purple-700">{entry.totalGames}</td>
                          <td className="py-4 px-6 text-gray-600">Level {entry.level}</td>
                        </>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No leaderboard data available</p>
            </div>
          )}
        </motion.div>
        
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center bg-white rounded-xl p-6 shadow-lg"
          >
            <p className="text-gray-700 mb-4">
              Want to see your rank? Log in to track your progress!
            </p>
            <a
              href="/login"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Log In
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-orange-600" />;
    default:
      return null;
  }
};

const formatTime = (seconds) => {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export default Leaderboard;
