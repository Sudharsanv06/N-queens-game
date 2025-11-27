// client/src/components/BoardGame/BoardCell.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

/**
 * Individual chess board cell component
 * Handles queen placement, highlighting, and animations
 */
const BoardCell = ({
  row,
  col,
  isLight,
  hasQueen,
  isAttacked,
  isSafe,
  showAttacked,
  showSafe,
  canPlace,
  onClick
}) => {
  // Base cell styling
  const baseStyles = isLight
    ? 'bg-chess-light hover:bg-amber-200'
    : 'bg-chess-dark hover:bg-amber-700';

  // Highlighting based on state
  let highlightStyles = '';
  if (hasQueen) {
    highlightStyles = 'ring-4 ring-queen-gold ring-inset bg-gradient-to-br from-yellow-300 to-amber-500';
  } else if (showAttacked && isAttacked) {
    highlightStyles = 'bg-red-400/40 hover:bg-red-400/60';
  } else if (showSafe && isSafe) {
    highlightStyles = 'bg-emerald-400/40 hover:bg-emerald-400/60';
  }

  // Cursor styling
  const cursorStyle = canPlace ? 'cursor-pointer' : 'cursor-not-allowed';

  return (
    <motion.div
      className={`
        relative aspect-square w-full
        flex items-center justify-center
        transition-all duration-200
        ${baseStyles}
        ${highlightStyles}
        ${cursorStyle}
        group
      `}
      onClick={() => canPlace && onClick(row, col)}
      whileHover={canPlace ? { scale: 1.05 } : {}}
      whileTap={canPlace ? { scale: 0.95 } : {}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Queen Icon */}
      {hasQueen && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Crown
            className="w-3/5 h-3/5 text-yellow-900 drop-shadow-lg"
            fill="currentColor"
            strokeWidth={1.5}
          />
        </motion.div>
      )}

      {/* Hover indicator for empty cells */}
      {!hasQueen && canPlace && (
        <div className="
          absolute inset-0 
          opacity-0 group-hover:opacity-30
          transition-opacity duration-200
          flex items-center justify-center
        ">
          <Crown
            className="w-2/5 h-2/5 text-gray-600"
            strokeWidth={2}
          />
        </div>
      )}

      {/* Cell coordinates (optional, for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="
          absolute top-0 left-0 
          text-[6px] text-gray-500 
          opacity-30 p-0.5
        ">
          {row},{col}
        </div>
      )}

      {/* Attack indicator (small dot) */}
      {!hasQueen && showAttacked && isAttacked && (
        <div className="
          absolute top-1 right-1 
          w-2 h-2 
          bg-red-500 
          rounded-full 
          opacity-50
        " />
      )}

      {/* Safe indicator (small dot) */}
      {!hasQueen && showSafe && isSafe && (
        <div className="
          absolute top-1 right-1 
          w-2 h-2 
          bg-emerald-500 
          rounded-full 
          opacity-50
        " />
      )}
    </motion.div>
  );
};

export default React.memo(BoardCell);
