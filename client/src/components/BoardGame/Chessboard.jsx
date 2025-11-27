// client/src/components/BoardGame/Chessboard.jsx
import React, { useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import BoardCell from './BoardCell';
import { useBoardLogic } from '../../hooks/useBoardLogic';
import { playSound } from '../../utils/sounds';

/**
 * Main N-Queens chessboard component
 * Renders the grid and manages cell states
 */
const Chessboard = () => {
  const {
    boardSize,
    showSafeCells,
    showAttackedCells,
    isQueenPlaced,
    isCellAttacked,
    isCellSafe,
    canPlaceQueen,
    handleCellClick,
    isComplete,
    soundEnabled,
    placedQueensCount
  } = useBoardLogic();

  const prevQueensCount = useRef(placedQueensCount);
  const prevIsComplete = useRef(isComplete);

  // Play sounds for game events
  useEffect(() => {
    if (!soundEnabled) return;

    // Game completed
    if (isComplete && !prevIsComplete.current) {
      playSound('success');
      prevIsComplete.current = isComplete;
      return;
    }

    // Queen placed or removed
    if (placedQueensCount > prevQueensCount.current) {
      playSound('placeQueen');
    }

    prevQueensCount.current = placedQueensCount;
  }, [placedQueensCount, isComplete, soundEnabled]);

  // Wrap cell click to handle invalid moves
  const handleCellClickWithSound = (row, col) => {
    const currentQueenPlaced = isQueenPlaced(row, col);
    const canPlaceHere = canPlaceQueen(row, col);

    // If trying to place on invalid cell, play error sound
    if (!currentQueenPlaced && !canPlaceHere && soundEnabled) {
      playSound('invalidMove');
      return; // Don't proceed with placement
    }

    handleCellClick(row, col);
  };

  // Generate board grid
  const boardGrid = useMemo(() => {
    const grid = [];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        grid.push({ row, col });
      }
    }
    return grid;
  }, [boardSize]);

  // Calculate cell size based on board size for responsiveness
  const getCellSize = () => {
    if (boardSize <= 8) return 'min-h-[50px] md:min-h-[60px] lg:min-h-[70px]';
    if (boardSize <= 12) return 'min-h-[40px] md:min-h-[50px] lg:min-h-[60px]';
    return 'min-h-[30px] md:min-h-[40px] lg:min-h-[50px]';
  };

  const cellSizeClass = getCellSize();

  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {/* Success overlay */}
      {isComplete && (
        <motion.div
          className="
            absolute inset-0 z-50
            bg-gradient-to-br from-emerald-500/20 to-cyan-500/20
            backdrop-blur-sm
            rounded-2xl
            border-4 border-emerald-500
            flex items-center justify-center
          "
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="
              bg-white/95 dark:bg-gray-800/95
              rounded-xl px-8 py-6
              shadow-2xl
              text-center
            "
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold text-emerald-600 mb-2">
              Puzzle Solved!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You completed the {boardSize}×{boardSize} N-Queens puzzle!
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Board container */}
      <div className="
        relative
        bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900
        rounded-2xl
        shadow-2xl
        p-2 md:p-4
        border-8 border-amber-950
      ">
        {/* Board grid */}
        <div
          className="
            grid gap-0
            bg-chess-dark
            rounded-lg
            overflow-hidden
            shadow-inner
          "
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            aspectRatio: '1 / 1'
          }}
        >
          {boardGrid.map(({ row, col }) => {
            const isLight = (row + col) % 2 === 0;
            const hasQueen = isQueenPlaced(row, col);
            const isAttacked = isCellAttacked(row, col);
            const isSafe = isCellSafe(row, col);
            const canPlace = canPlaceQueen(row, col);

            return (
              <BoardCell
                key={`${row}-${col}`}
                row={row}
                col={col}
                isLight={isLight}
                hasQueen={hasQueen}
                isAttacked={isAttacked}
                isSafe={isSafe}
                showAttacked={showAttackedCells}
                showSafe={showSafeCells}
                canPlace={canPlace}
                onClick={handleCellClickWithSound}
              />
            );
          })}
        </div>

        {/* Board coordinates (optional) */}
        <div className="mt-2 flex justify-between text-xs text-amber-200 px-2">
          <span>A</span>
          <span>{String.fromCharCode(65 + boardSize - 1)}</span>
        </div>
      </div>

      {/* Mobile-friendly tap hint */}
      {!isComplete && (
        <motion.p
          className="
            text-center mt-4 text-sm text-gray-500
            dark:text-gray-400
            md:hidden
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Tap cells to place or remove queens
        </motion.p>
      )}
    </motion.div>
  );
};

export default Chessboard;
