import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, Home, Play, Zap } from 'lucide-react';
import './TimeTrialSelector.css';

const TimeTrialSelector = () => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(8);
  const [selectedTime, setSelectedTime] = useState(180); // Default 3 minutes

  const sizeOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  const timeOptions = [
    { value: 60, label: '1 Min', difficulty: 'Extreme' },
    { value: 120, label: '2 Min', difficulty: 'Hard' },
    { value: 180, label: '3 Min', difficulty: 'Medium' },
    { value: 300, label: '5 Min', difficulty: 'Easy' },
  ];

  const handleStartGame = () => {
    navigate(`/time-trial-game?size=${selectedSize}&time=${selectedTime}`);
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
          <Clock size={32} color="#ef4444" />
          <h1>Time Trial Mode</h1>
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

          <h2 className="time-selector-title">Select Time Limit</h2>
          
          <div className="time-grid">
            {timeOptions.map((option, index) => (
              <motion.button
                key={option.value}
                className={`time-option ${selectedTime === option.value ? 'active' : ''}`}
                onClick={() => setSelectedTime(option.value)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="time-label">{option.label}</div>
                <div className="time-difficulty">{option.difficulty}</div>
              </motion.button>
            ))}
          </div>

          <div className="difficulty-info">
            <div className="difficulty-badge time-trial-badge">
              <Zap size={16} />
              <span>Race Against Time</span>
            </div>
            <p className="size-description">
              Complete the {selectedSize}×{selectedSize} puzzle in {selectedTime / 60} minute{selectedTime > 60 ? 's' : ''} or less!
            </p>
          </div>

          <motion.button
            className="start-game-btn time-trial-btn"
            onClick={handleStartGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={24} />
            Start Time Trial ({selectedSize}×{selectedSize} - {selectedTime / 60}min)
          </motion.button>

          <p className="hint-text">
            Beat the clock and climb the leaderboard!
          </p>
        </motion.div>

        {/* Info Cards */}
        <div className="info-cards">
          <motion.div
            className="info-card time-trial-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>⏰ Time Challenge</h3>
            <p>Complete the puzzle before time runs out! The countdown timer will tick down from your selected time limit.</p>
          </motion.div>

          <motion.div
            className="info-card time-trial-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>🏆 Scoring</h3>
            <ul>
              <li>Time bonus for finishing early</li>
              <li>Speed multiplier</li>
              <li>Fewer moves = higher score</li>
              <li>Global leaderboard ranking</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrialSelector;
