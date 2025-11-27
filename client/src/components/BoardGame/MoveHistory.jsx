// client/src/components/BoardGame/MoveHistory.jsx
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, Undo2, Crown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectMoveHistory,
  selectBoardSize,
  undoMove,
  resetBoard
} from '../../store/slices/boardGameSlice';

/**
 * MoveHistory Component
 * Displays a scrollable list of all queen placements and removals
 */
const MoveHistory = ({ compact = false }) => {
  const dispatch = useDispatch();
  const moveHistory = useSelector(selectMoveHistory);
  const boardSize = useSelector(selectBoardSize);
  const historyEndRef = useRef(null);

  // Auto-scroll to bottom when new moves are added
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [moveHistory.length]);

  // Format cell position (e.g., "A1", "B3")
  const formatPosition = (row, col) => {
    const colLetter = String.fromCharCode(65 + col); // A, B, C, ...
    const rowNumber = row + 1;
    return `${colLetter}${rowNumber}`;
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get relative time from first move
  const getRelativeTime = (timestamp) => {
    if (moveHistory.length === 0) return '0s';
    
    const firstMove = moveHistory[0].timestamp;
    const elapsed = Math.floor((timestamp - firstMove) / 1000);
    
    if (elapsed < 60) return `${elapsed}s`;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUndo = () => {
    dispatch(undoMove());
  };

  const handleClearHistory = () => {
    dispatch(resetBoard());
  };

  // Compact mode - just show move count
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-gray-700">
        <History className="w-4 h-4" />
        <span className="text-sm font-semibold">{moveHistory.length} moves</span>
      </div>
    );
  }

  // Full mode with scrollable history
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border-2 border-gray-200 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-royal-purple-600" />
          <h3 className="text-sm font-bold text-gray-800">Move History</h3>
          <span className="text-xs bg-royal-purple-100 text-royal-purple-700 px-2 py-0.5 rounded-full font-medium">
            {moveHistory.length}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            disabled={moveHistory.length === 0}
            className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo Last Move (U)"
          >
            <Undo2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearHistory}
            disabled={moveHistory.length === 0}
            className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear All (R)"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {moveHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <History className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm text-center">No moves yet<br />Place a queen to start</p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {moveHistory.map((move, index) => (
                <motion.div
                  key={`${move.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    move.type === 'place'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {/* Move Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700 border-2 border-gray-300">
                    #{index + 1}
                  </div>

                  {/* Move Icon */}
                  <div className="flex-shrink-0">
                    {move.type === 'place' ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Move Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        move.type === 'place' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {move.type === 'place' ? 'Placed' : 'Removed'}
                      </span>
                      <span className="text-sm font-mono font-bold text-gray-700">
                        {formatPosition(move.row, move.col)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{formatTime(move.timestamp)}</span>
                      <span>•</span>
                      <span>+{getRelativeTime(move.timestamp)}</span>
                    </div>
                  </div>

                  {/* Board Coordinates */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-gray-500">Row {move.row + 1}</div>
                    <div className="text-xs text-gray-500">Col {move.col + 1}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Scroll anchor */}
            <div ref={historyEndRef} />
          </>
        )}
      </div>

      {/* Footer Stats */}
      {moveHistory.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-500">Total</div>
              <div className="font-bold text-gray-700">{moveHistory.length}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Placed</div>
              <div className="font-bold text-green-600">
                {moveHistory.filter(m => m.type === 'place').length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Removed</div>
              <div className="font-bold text-red-600">
                {moveHistory.filter(m => m.type === 'remove').length}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MoveHistory;
