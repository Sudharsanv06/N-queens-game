// client/src/components/BoardGame/Timer.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectTimerRunning,
  selectTimerElapsed,
  selectIsComplete,
  updateTimerElapsed,
  startTimer,
  stopTimer,
  resetTimer
} from '../../store/slices/boardGameSlice';

/**
 * Timer Component
 * Displays elapsed time with start/stop/reset controls
 */
const Timer = ({ compact = false }) => {
  const dispatch = useDispatch();
  const timerRunning = useSelector(selectTimerRunning);
  const timerElapsed = useSelector(selectTimerElapsed);
  const isComplete = useSelector(selectIsComplete);

  // Update timer every second when running
  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      dispatch(updateTimerElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, dispatch]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time as HH:MM:SS for longer times
  const formatLongTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (timerRunning) {
      dispatch(stopTimer());
    } else {
      dispatch(startTimer());
    }
  };

  const handleReset = () => {
    dispatch(resetTimer());
  };

  // Compact mode - just the time display
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-gray-700">
        <Clock className="w-4 h-4" />
        <span className="font-mono text-sm font-semibold">
          {formatTime(timerElapsed)}
        </span>
      </div>
    );
  }

  // Full mode with controls
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-royal-purple-600" />
          <h3 className="text-sm font-bold text-gray-800">Time</h3>
        </div>
        
        {isComplete && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            Completed
          </span>
        )}
      </div>

      {/* Time Display */}
      <div className="mb-4">
        <motion.div
          key={timerElapsed}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="text-4xl font-mono font-bold text-royal-purple-600">
            {formatLongTime(timerElapsed)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {timerRunning ? 'Running...' : isComplete ? 'Final Time' : 'Paused'}
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      {!isComplete && (
        <div className="flex gap-2">
          {/* Start/Stop Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartStop}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              timerRunning
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {timerRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </motion.button>

          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            disabled={timerElapsed === 0}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Status:</span>
            <span className="ml-1 font-medium text-gray-700">
              {timerRunning ? '🟢 Running' : '⏸️ Paused'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Elapsed:</span>
            <span className="ml-1 font-medium text-gray-700">
              {timerElapsed}s
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Timer;
