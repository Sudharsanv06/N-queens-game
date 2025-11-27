import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, Clock, Move, Lightbulb, Star, RotateCcw, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { clearCurrentPuzzle } from '../store/slices/puzzleSlice';

const PuzzleCompleted = () => {
  const { puzzleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { attempt, puzzle } = location.state || {};

  useEffect(() => {
    if (!attempt || !puzzle) {
      toast.error('No completion data found');
      navigate('/puzzles');
    }

    return () => {
      dispatch(clearCurrentPuzzle());
    };
  }, [attempt, puzzle, navigate, dispatch]);

  if (!attempt || !puzzle) {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceLabel = () => {
    const ratio = attempt.timeTaken / puzzle.expectedMinTime;
    if (ratio <= 1) return { text: 'Excellent!', color: 'text-green-600' };
    if (ratio <= 1.5) return { text: 'Good!', color: 'text-yellow-600' };
    if (ratio <= 2) return { text: 'Keep Practicing', color: 'text-orange-600' };
    return { text: 'Need More Practice', color: 'text-red-600' };
  };

  const performance = getPerformanceLabel();

  const renderStars = () => {
    return (
      <div className="flex items-center justify-center space-x-2">
        {[1, 2, 3].map((star) => (
          <motion.div
            key={star}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: star * 0.2, type: 'spring' }}
          >
            <Star
              className={`w-16 h-16 ${
                star <= attempt.stars
                  ? 'fill-yellow-400 text-yellow-500'
                  : 'fill-gray-200 text-gray-300'
              }`}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-purple-200"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              {attempt.solved ? 'Puzzle Solved!' : 'Puzzle Incomplete'}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              {puzzle.puzzleName}
            </motion.p>
          </div>

          {/* Stars Display */}
          {attempt.solved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              {renderStars()}
              <p className={`text-center text-2xl font-bold mt-4 ${performance.color}`}>
                {performance.text}
              </p>
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            {/* Time Taken */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Time Taken</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatTime(attempt.timeTaken)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Target: {formatTime(puzzle.expectedMinTime)}
              </p>
            </div>

            {/* Moves Used */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Move className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">Moves</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {attempt.movesUsed}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Total moves made
              </p>
            </div>

            {/* Hints Used */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-700">Hints Used</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {attempt.hintsUsed} / {puzzle.maxHints}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Hints requested
              </p>
            </div>

            {/* Stars Earned */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-semibold text-pink-700">Stars</span>
              </div>
              <p className="text-2xl font-bold text-pink-900">
                {attempt.stars} / 3
              </p>
              <p className="text-xs text-pink-600 mt-1">
                {attempt.solved ? 'Stars earned' : 'Not completed'}
              </p>
            </div>
          </motion.div>

          {/* Performance Comparison */}
          {attempt.solved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6"
            >
              <h3 className="font-semibold text-gray-800 mb-3">Performance Analysis</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Your Time:</span>
                  <span className="font-bold text-gray-800">
                    {formatTime(attempt.timeTaken)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expected Time:</span>
                  <span className="font-bold text-gray-800">
                    {formatTime(puzzle.expectedMinTime)}
                  </span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      attempt.stars === 3
                        ? 'bg-green-500'
                        : attempt.stars === 2
                        ? 'bg-yellow-500'
                        : 'bg-orange-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (puzzle.expectedMinTime / attempt.timeTaken) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>

                <p className="text-xs text-gray-600 mt-2">
                  {attempt.timeTaken <= puzzle.expectedMinTime
                    ? `You were ${Math.round(
                        ((puzzle.expectedMinTime - attempt.timeTaken) /
                          puzzle.expectedMinTime) *
                          100
                      )}% faster than expected!`
                    : `You took ${Math.round(
                        ((attempt.timeTaken - puzzle.expectedMinTime) /
                          puzzle.expectedMinTime) *
                          100
                      )}% longer than expected.`}
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => navigate(`/puzzles/${puzzleId}`)}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Again</span>
            </button>

            <button
              onClick={() => navigate('/puzzles')}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              <ArrowRight className="w-5 h-5" />
              <span>More Puzzles</span>
            </button>
          </motion.div>

          {/* Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-500">
              {attempt.stars === 3
                ? '🎉 Perfect! Can you beat your time?'
                : attempt.stars === 2
                ? '💪 Good job! Try for 3 stars next time!'
                : attempt.solved
                ? '🔥 Keep practicing to improve your time!'
                : '💡 Use hints strategically to solve the puzzle!'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PuzzleCompleted;
