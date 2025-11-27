// client/src/components/BoardGame/NQueensGame.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Chessboard from './Chessboard';
import GameController from './GameController';
import { useBoardLogic } from '../../hooks/useBoardLogic';

/**
 * Main N-Queens Game Page
 * Combines the chessboard and game controller
 */
const NQueensGame = () => {
  const { handleInitialize, boardSize } = useBoardLogic();

  // Initialize game on mount
  useEffect(() => {
    handleInitialize(boardSize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-navy via-midnight-blue to-slate-gray py-8 px-4">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <h1 className="
            text-4xl md:text-6xl font-orbitron font-bold
            bg-gradient-to-r from-royal-purple via-electric-blue to-cyan-glow
            bg-clip-text text-transparent
            mb-4
          ">
            N-Queens Challenge
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Place {boardSize} queens on the board so that no two queens threaten each other.
            No two queens can share the same row, column, or diagonal.
          </p>
        </motion.header>

        {/* Game Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Chessboard */}
          <div className="order-2 lg:order-1">
            <Chessboard />
          </div>

          {/* Game Controller */}
          <div className="order-1 lg:order-2">
            <GameController />
          </div>
        </div>

        {/* Rules Section */}
        <motion.div
          className="
            mt-12 max-w-4xl mx-auto
            bg-white/5 backdrop-blur-sm
            rounded-2xl p-6
            border border-white/10
          "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            How to Play
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">1.</span>
              <span>Click on any cell to place a queen. Click again to remove it.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">2.</span>
              <span>Queens attack all cells in their row, column, and both diagonals.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">3.</span>
              <span>Red cells show attacked positions. Green cells show safe positions.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">4.</span>
              <span>Place all {boardSize} queens without any conflicts to win!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 font-bold">5.</span>
              <span>Use hints if you're stuck, but they'll reduce your final score.</span>
            </li>
          </ul>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-12 text-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>Built with React 18, Redux Toolkit, Tailwind CSS, and Framer Motion</p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default NQueensGame;
