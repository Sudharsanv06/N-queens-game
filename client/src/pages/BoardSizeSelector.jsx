import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ArrowLeft, Home, Play } from 'lucide-react';
import './BoardSizeSelector.css';

const BoardSizeSelector = () => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(8);

  const sizeOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  const handleStartGame = () => {
    navigate(`/classic-game?size=${selectedSize}`);
  };

  return (
    <div className="board-size-page">
      {/* Header */}
      <div className="size-header">
        <button className="back-btn" onClick={() => navigate('/play')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="size-title">
          <Crown size={32} color="#9333ea" />
          <h1>Classic Mode</h1>
        </div>
        <button className="home-btn" onClick={() => navigate('/')}>
          <Home size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="size-content">
        <motion.div
          className="size-selector-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Select Board Size</h2>
          
          <div className="size-grid">
            {sizeOptions.map((size, index) => (
              <motion.button
                key={size}
                className={`size-option ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {size}×{size}
              </motion.button>
            ))}
          </div>

          <div className="difficulty-info">
            <div className="difficulty-badge">
              {selectedSize <= 6 && <span className="easy">Easy</span>}
              {selectedSize > 6 && selectedSize <= 10 && <span className="medium">Medium</span>}
              {selectedSize > 10 && selectedSize <= 14 && <span className="hard">Hard</span>}
              {selectedSize > 14 && <span className="expert">Expert</span>}
            </div>
            <p className="size-description">
              {selectedSize <= 6 && 'Perfect for beginners - Quick and fun!'}
              {selectedSize > 6 && selectedSize <= 10 && 'Balanced challenge - Test your skills!'}
              {selectedSize > 10 && selectedSize <= 14 && 'Advanced puzzle - Think strategically!'}
              {selectedSize > 14 && 'Master level - Ultimate challenge!'}
            </p>
          </div>

          <motion.button
            className="start-game-btn"
            onClick={handleStartGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={24} />
            Start Game ({selectedSize}×{selectedSize})
          </motion.button>

          <p className="hint-text">
            Select your preferred board size and click "Start Game" to begin
          </p>
        </motion.div>

        {/* Info Cards */}
        <div className="info-cards">
          <motion.div
            className="info-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>🎯 Objective</h3>
            <p>Place {selectedSize} queens on the {selectedSize}×{selectedSize} board so that no two queens attack each other.</p>
          </motion.div>

          <motion.div
            className="info-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>⚡ Features</h3>
            <ul>
              <li>Real-time timer</li>
              <li>Move counter</li>
              <li>Score tracking</li>
              <li>3 hints available</li>
              <li>Global leaderboard</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BoardSizeSelector;
