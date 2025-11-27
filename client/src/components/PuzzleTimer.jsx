import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PuzzleTimer = ({ startTime, isActive, expectedTime, onTimeUpdate }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - new Date(startTime).getTime()) / 1000);
      setElapsedTime(elapsed);

      // Send time update to parent
      if (onTimeUpdate) {
        onTimeUpdate(elapsed);
      }

      // Warning when exceeding expected time
      if (elapsed > expectedTime && !isWarning) {
        setIsWarning(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, expectedTime, isWarning, onTimeUpdate]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceColor = () => {
    if (elapsedTime <= expectedTime) {
      return 'text-green-600'; // Excellent
    } else if (elapsedTime <= expectedTime * 1.5) {
      return 'text-yellow-600'; // Good
    } else if (elapsedTime <= expectedTime * 2) {
      return 'text-orange-600'; // Average
    } else {
      return 'text-red-600'; // Needs improvement
    }
  };

  const getPerformanceLabel = () => {
    if (elapsedTime <= expectedTime) {
      return '3 ⭐ - Excellent!';
    } else if (elapsedTime <= expectedTime * 1.5) {
      return '2 ⭐ - Good!';
    } else {
      return '1 ⭐ - Keep trying!';
    }
  };

  const progress = Math.min((elapsedTime / expectedTime) * 100, 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className={`w-5 h-5 ${getPerformanceColor()}`} />
          <span className="font-semibold text-gray-700">Time</span>
        </div>
        
        {isWarning && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center space-x-1 text-orange-600"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Over target!</span>
          </motion.div>
        )}
      </div>

      {/* Timer display */}
      <div className="text-center mb-3">
        <div className={`text-4xl font-bold font-mono ${getPerformanceColor()}`}>
          {formatTime(elapsedTime)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Target: {formatTime(expectedTime)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${
            progress < 100
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : progress < 150
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
              : 'bg-gradient-to-r from-red-400 to-red-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Performance indicator */}
      <div className="text-center">
        <span className={`text-xs font-semibold ${getPerformanceColor()}`}>
          {getPerformanceLabel()}
        </span>
      </div>
    </div>
  );
};

export default PuzzleTimer;
