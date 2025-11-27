import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Star, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const PuzzleCard = ({ puzzle }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handlePlayClick = () => {
    navigate(`/puzzles/${puzzle.puzzleId}`);
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
    >
      {/* Header with difficulty badge */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">
              {puzzle.puzzleName}
            </h3>
            <p className="text-purple-100 text-sm">
              Puzzle #{puzzle.puzzleId.split('-')[1]}
            </p>
          </div>
          
          {puzzle.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <CheckCircle className="w-6 h-6 text-green-300" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Puzzle info */}
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {puzzle.description}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">
                {puzzle.n}×{puzzle.n}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Board Size</p>
              <p className="text-sm font-semibold text-gray-800">
                {puzzle.n} Queens
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Locked</p>
              <p className="text-sm font-semibold text-gray-800">
                {puzzle.initialQueens?.length || 0} Queens
              </p>
            </div>
          </div>
        </div>

        {/* Difficulty & Expected Time */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
              puzzle.difficulty
            )}`}
          >
            {puzzle.difficulty.charAt(0).toUpperCase() +
              puzzle.difficulty.slice(1)}
          </span>

          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">~{formatTime(puzzle.expectedMinTime)}</span>
          </div>
        </div>

        {/* User progress (if completed) */}
        {puzzle.completed && puzzle.userProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4 border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  Your Best
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < puzzle.userProgress.bestStars
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-green-700">
                  {formatTime(puzzle.userProgress.bestTime)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Play button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayClick}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
            puzzle.completed
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
          }`}
        >
          {puzzle.completed ? 'Play Again' : 'Start Puzzle'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PuzzleCard;
