// client/src/components/BoardGame/GameController.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Lightbulb,
  Undo2,
  Crown,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  Keyboard
} from 'lucide-react';
import { useBoardLogic } from '../../hooks/useBoardLogic';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import Timer from './Timer';
import MoveHistory from './MoveHistory';
import { initSounds } from '../../utils/sounds';

/**
 * Game controller component with settings and statistics
 * Provides UI for board size selection, visibility toggles, and game actions
 */
const GameController = () => {
  const {
    boardSize,
    progress,
    isComplete,
    showSafeCells,
    showAttackedCells,
    hintsUsed,
    score,
    gameStatus,
    soundEnabled,
    handleReset,
    handleBoardSizeChange,
    handleToggleSafeCells,
    handleToggleAttackedCells,
    handleUseHint,
    handleUndo,
    handleToggleSound,
    getCurrentHint
  } = useBoardLogic();

  const [showHint, setShowHint] = useState(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Initialize sounds on mount
  useEffect(() => {
    initSounds();
  }, []);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    enabled: true,
    enableSounds: soundEnabled,
    onReset: () => setShowHint(null),
    onHint: () => {
      const hint = getCurrentHint();
      if (hint) {
        setShowHint(hint);
        setTimeout(() => setShowHint(null), 3000);
      }
    }
  });

  // Handle hint button click
  const onHintClick = () => {
    handleUseHint();
    const hint = getCurrentHint();
    if (hint) {
      setShowHint(hint);
      // Clear hint after 3 seconds
      setTimeout(() => setShowHint(null), 3000);
    }
  };

  // Board size options
  const boardSizes = [4, 5, 6, 7, 8, 9, 10, 12, 15, 20];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Row: Timer and Sound Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timer Component */}
        <div className="md:col-span-2">
          <Timer compact={false} />
        </div>

        {/* Sound and Keyboard Controls */}
        <div className="space-y-4">
          {/* Sound Toggle */}
          <motion.button
            onClick={handleToggleSound}
            className={`
              w-full flex items-center justify-center gap-2
              font-semibold py-3 px-4 rounded-xl
              transition-all duration-200
              shadow-md
              ${
                soundEnabled
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </motion.button>

          {/* Keyboard Help Toggle */}
          <motion.button
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="
              w-full flex items-center justify-center gap-2
              bg-gradient-to-r from-purple-500 to-indigo-500
              hover:from-purple-600 hover:to-indigo-600
              text-white font-semibold
              py-3 px-4 rounded-xl
              transition-all duration-200
              shadow-md
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Keyboard className="w-5 h-5" />
            <span>Shortcuts</span>
          </motion.button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {showKeyboardHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-700"
        >
          <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono font-bold">R</kbd>
              <span className="text-gray-700 dark:text-gray-300">Reset Board</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono font-bold">H</kbd>
              <span className="text-gray-700 dark:text-gray-300">Get Hint</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono font-bold">U</kbd>
              <span className="text-gray-700 dark:text-gray-300">Undo Move</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Move History */}
      <div className="h-96">
        <MoveHistory compact={false} />
      </div>

      {/* Status Bar */}
      <motion.div
        className="
          bg-gradient-to-r from-royal-purple to-deep-purple
          rounded-2xl p-6
          shadow-premium
          text-white
        "
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Queens Placed */}
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-queen-gold" />
            <div>
              <p className="text-sm opacity-80">Queens</p>
              <p className="text-2xl font-bold">
                {progress.placed}/{progress.total}
              </p>
            </div>
          </div>

          {/* Progress Percentage */}
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-sm opacity-80">Progress</p>
              <p className="text-2xl font-bold">{progress.percentage}%</p>
            </div>
          </div>

          {/* Hints Used */}
          <div className="flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-sm opacity-80">Hints</p>
              <p className="text-2xl font-bold">{hintsUsed}</p>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-golden-yellow" />
            <div>
              <p className="text-sm opacity-80">Score</p>
              <p className="text-2xl font-bold">{score}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Status Message */}
        {gameStatus === 'not-started' && (
          <p className="mt-4 text-center text-sm opacity-80">
            Click on the board to place queens
          </p>
        )}
        {gameStatus === 'in-progress' && !isComplete && (
          <p className="mt-4 text-center text-sm opacity-80">
            Place {progress.total - progress.placed} more queens
          </p>
        )}
        {isComplete && (
          <motion.p
            className="mt-4 text-center text-lg font-bold text-emerald-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            🎉 Puzzle Solved! Score: {score}
          </motion.p>
        )}
      </motion.div>

      {/* Control Panel */}
      <motion.div
        className="
          bg-white dark:bg-midnight-blue
          rounded-2xl p-6
          shadow-premium
          border border-gray-200 dark:border-slate-gray
        "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Board Size Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Board Size: {boardSize}×{boardSize}
          </label>
          <div className="flex flex-wrap gap-2">
            {boardSizes.map((size) => (
              <motion.button
                key={size}
                onClick={() => handleBoardSizeChange(size)}
                className={`
                  px-4 py-2 rounded-lg font-semibold
                  transition-all duration-200
                  ${
                    boardSize === size
                      ? 'bg-royal-purple text-white shadow-neon'
                      : 'bg-gray-200 dark:bg-slate-gray text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-cool-gray'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {size}×{size}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Reset Button */}
          <motion.button
            onClick={handleReset}
            className="
              flex items-center justify-center gap-2
              bg-rose-pink hover:bg-red-600
              text-white font-semibold
              py-3 px-4 rounded-lg
              transition-all duration-200
              shadow-hover-lift
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </motion.button>

          {/* Undo Button */}
          <motion.button
            onClick={handleUndo}
            className="
              flex items-center justify-center gap-2
              bg-electric-blue hover:bg-blue-600
              text-white font-semibold
              py-3 px-4 rounded-lg
              transition-all duration-200
              shadow-hover-lift
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Undo2 className="w-5 h-5" />
            <span>Undo</span>
          </motion.button>

          {/* Hint Button */}
          <motion.button
            onClick={onHintClick}
            className="
              flex items-center justify-center gap-2
              bg-golden-yellow hover:bg-yellow-600
              text-white font-semibold
              py-3 px-4 rounded-lg
              transition-all duration-200
              shadow-hover-lift
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb className="w-5 h-5" />
            <span>Hint</span>
          </motion.button>

          {/* Toggle Attacked Cells */}
          <motion.button
            onClick={handleToggleAttackedCells}
            className={`
              flex items-center justify-center gap-2
              font-semibold py-3 px-4 rounded-lg
              transition-all duration-200
              shadow-hover-lift
              ${
                showAttackedCells
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 dark:bg-slate-gray hover:bg-gray-400 text-gray-700 dark:text-gray-300'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAttackedCells ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            <span className="hidden md:inline">Attacks</span>
          </motion.button>
        </div>

        {/* Toggle Safe Cells (Secondary) */}
        <div className="mt-3">
          <motion.button
            onClick={handleToggleSafeCells}
            className={`
              w-full flex items-center justify-center gap-2
              font-semibold py-3 px-4 rounded-lg
              transition-all duration-200
              ${
                showSafeCells
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-gray hover:bg-gray-300 text-gray-700 dark:text-gray-300'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showSafeCells ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            <span>Show Safe Cells</span>
          </motion.button>
        </div>

        {/* Hint Display */}
        {showHint && (
          <motion.div
            className="
              mt-4 p-4 
              bg-gradient-to-r from-yellow-100 to-amber-100
              dark:from-yellow-900/30 dark:to-amber-900/30
              border-2 border-yellow-400
              rounded-lg
            "
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  Hint: Try placing a queen at
                </p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  Row {showHint.row + 1}, Column {String.fromCharCode(65 + showHint.col)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Legend */}
      <motion.div
        className="
          bg-white dark:bg-midnight-blue
          rounded-xl p-4
          shadow-lg
          border border-gray-200 dark:border-slate-gray
        "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-queen-gold rounded" />
            <span className="text-gray-600 dark:text-gray-400">Queen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400/60 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Under Attack</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-400/60 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Safe Cell</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-chess-light border border-gray-300 rounded" />
            <span className="text-gray-600 dark:text-gray-400">Empty Cell</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameController;
