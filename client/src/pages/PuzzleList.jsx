import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Puzzle, Trophy, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PuzzleCard from '../components/PuzzleCard';
import {
  fetchPuzzleList,
  fetchUserPuzzleProgress,
  setFilters,
  clearFilters
} from '../store/slices/puzzleSlice';

const PuzzleList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    puzzles,
    userProgress,
    listLoading,
    progressLoading,
    filters
  } = useSelector((state) => state.puzzle);

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    dispatch(fetchPuzzleList(filters));
    
    if (isAuthenticated) {
      dispatch(fetchUserPuzzleProgress());
    }
  }, [dispatch, isAuthenticated, filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    setShowFilters(false);
  };

  const resetFilters = () => {
    const emptyFilters = { difficulty: null, category: null, n: null };
    setLocalFilters(emptyFilters);
    dispatch(clearFilters());
    setShowFilters(false);
  };

  const getDifficultyLabel = (difficulty) => {
    return difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'All';
  };

  if (listLoading && puzzles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading puzzles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <Puzzle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Puzzle Mode
          </h1>
          <p className="text-gray-600 text-lg">
            Master challenging N-Queens puzzles and earn stars!
          </p>
        </motion.div>

        {/* User Progress Summary */}
        {isAuthenticated && userProgress && !progressLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-800">Your Progress</h2>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              >
                View All Stats →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {userProgress.overview.completedPuzzles}
                </div>
                <div className="text-sm text-gray-600 mt-1">Completed</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {userProgress.overview.completionRate}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Completion</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {userProgress.overview.totalStars}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Stars</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {userProgress.overview.averageStars}
                </div>
                <div className="text-sm text-gray-600 mt-1">Avg Stars</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="font-semibold">Filters</span>
              </button>

              {(filters.difficulty || filters.n) && (
                <div className="flex items-center space-x-2">
                  {filters.difficulty && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {getDifficultyLabel(filters.difficulty)}
                    </span>
                  )}
                  {filters.n && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {filters.n}×{filters.n}
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {puzzles.length} puzzle{puzzles.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Difficulty filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={localFilters.difficulty || ''}
                    onChange={(e) =>
                      handleFilterChange('difficulty', e.target.value || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Board size filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Board Size
                  </label>
                  <select
                    value={localFilters.n || ''}
                    onChange={(e) =>
                      handleFilterChange('n', e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Sizes</option>
                    <option value="4">4×4</option>
                    <option value="5">5×5</option>
                    <option value="6">6×6</option>
                    <option value="7">7×7</option>
                    <option value="8">8×8</option>
                  </select>
                </div>

                {/* Apply button */}
                <div className="flex items-end">
                  <button
                    onClick={applyFilters}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Puzzle Grid */}
        {puzzles.length === 0 ? (
          <div className="text-center py-12">
            <Puzzle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No puzzles found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {puzzles.map((puzzle) => (
              <PuzzleCard key={puzzle.puzzleId} puzzle={puzzle} />
            ))}
          </div>
        )}

        {/* Guest prompt */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-center"
          >
            <h3 className="text-white font-bold text-xl mb-2">
              Want to track your progress?
            </h3>
            <p className="text-purple-100 mb-4">
              Sign in to save your attempts, earn stars, and compete on leaderboards!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Sign In Now
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PuzzleList;
