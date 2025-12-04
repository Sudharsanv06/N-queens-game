import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown,
  Clock, 
  Star, 
  Users, 
  Puzzle,
  Trophy,
  Play as PlayIcon,
  Gamepad2,
  Target,
  Zap
} from 'lucide-react';
import './Play.css';

const Play = () => {
  const navigate = useNavigate();

  const gameModesData = [
    {
      id: 'classic',
      title: 'Classic Mode',
      description: 'Solve the traditional N-Queens puzzle with different board sizes',
      icon: Crown,
      colorClass: 'play-card-purple',
      path: '/board-size-selector',
      features: ['4×4 to 16×16 boards', 'Score tracking', 'Achievements'],
      difficulty: 'All Levels'
    },
    {
      id: 'time-trial',
      title: 'Time Trial',
      description: 'Race against the clock to solve puzzles as fast as possible',
      icon: Clock,
      colorClass: 'play-card-red',
      path: '/time-trial-selector',
      features: ['Countdown timer', 'Speed bonuses', 'Leaderboards'],
      difficulty: 'Challenging'
    },
    {
      id: 'daily-challenge',
      title: 'Daily Challenge',
      description: 'Complete today\'s special puzzle and compete with others',
      icon: Star,
      colorClass: 'play-card-yellow',
      path: '/daily-challenge',
      features: ['New puzzle daily', 'Global rankings', 'Special rewards'],
      difficulty: 'Varies Daily'
    },
    {
      id: 'multiplayer',
      title: 'Multiplayer',
      description: 'Challenge other players in real-time competitive matches',
      icon: Users,
      colorClass: 'play-card-blue',
      path: '/multiplayer',
      features: ['Real-time matches', 'Ranked mode', 'Chat support'],
      difficulty: 'Competitive'
    },
    {
      id: 'puzzle-mode',
      title: 'Puzzle Library',
      description: 'Explore hundreds of pre-designed puzzles with unique challenges',
      icon: Puzzle,
      colorClass: 'play-card-green',
      path: '/puzzles',
      features: ['200+ puzzles', 'Difficulty levels', 'Custom solutions'],
      difficulty: 'Easy to Expert'
    },
    {
      id: 'free-trial',
      title: 'Free Practice',
      description: 'Practice without pressure - no account required',
      icon: Gamepad2,
      colorClass: 'play-card-indigo',
      path: '/game?size=8&mode=free-trial',
      features: ['No login needed', 'Unlimited hints', 'Relaxed mode'],
      difficulty: 'Beginner Friendly'
    }
  ];

  const handleModeSelect = (path) => {
    navigate(path);
  };

  return (
    <div className="play-page-container">
      {/* Background Decorations */}
      <div className="play-bg-decoration play-decoration-1"></div>
      <div className="play-bg-decoration play-decoration-2"></div>

      {/* Hero Section */}
      <div className="play-hero">
        <div className="play-hero-icon">
          <Trophy size={40} color="white" />
        </div>
        <h1 className="play-hero-title">Choose Your Game Mode</h1>
        <p className="play-hero-subtitle">
          Select from multiple game modes to test your puzzle-solving skills
        </p>
      </div>

      {/* Game Modes Grid */}
      <div className="play-modes-grid">
        {gameModesData.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.id}
              className={`play-mode-card ${mode.colorClass}`}
              onClick={() => handleModeSelect(mode.path)}
            >
              {/* Card Header */}
              <div className="play-mode-header">
                <div className="play-mode-header-top">
                  <div>
                    <h3 className="play-mode-title">{mode.title}</h3>
                    <span className="play-mode-difficulty">{mode.difficulty}</span>
                  </div>
                  <Icon className="play-mode-icon" />
                </div>
              </div>

              {/* Card Body */}
              <div className="play-mode-body">
                <p className="play-mode-description">{mode.description}</p>

                {/* Features */}
                <ul className="play-mode-features">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="play-mode-feature">
                      <div className="play-feature-dot"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Play Button */}
                <button className="play-mode-btn">
                  <PlayIcon className="play-btn-icon" size={20} />
                  <span>Play Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="play-stats">
        <div className="play-stat-card">
          <Target className="play-stat-icon" size={56} color="#9333ea" />
          <h3 className="play-stat-number">∞</h3>
          <p className="play-stat-label">Puzzles Available</p>
        </div>
        <div className="play-stat-card">
          <Trophy className="play-stat-icon" size={56} color="#f59e0b" />
          <h3 className="play-stat-number">6</h3>
          <p className="play-stat-label">Game Modes</p>
        </div>
        <div className="play-stat-card">
          <Zap className="play-stat-icon" size={56} color="#3b82f6" />
          <h3 className="play-stat-number">Live</h3>
          <p className="play-stat-label">Multiplayer Matches</p>
        </div>
      </div>

      {/* How to Play Section */}
      <div className="play-guide">
        <div className="play-guide-container">
          <h2 className="play-guide-title">How to Play</h2>
          <div className="play-steps-grid">
            <div className="play-step">
              <div className="play-step-number">1</div>
              <h4 className="play-step-title">Choose a Mode</h4>
              <p className="play-step-desc">
                Select from Classic, Time Trial, Daily Challenge, or Multiplayer
              </p>
            </div>
            <div className="play-step">
              <div className="play-step-number">2</div>
              <h4 className="play-step-title">Place Queens</h4>
              <p className="play-step-desc">
                Click cells to place queens on the chessboard
              </p>
            </div>
            <div className="play-step">
              <div className="play-step-number">3</div>
              <h4 className="play-step-title">No Conflicts</h4>
              <p className="play-step-desc">
                Ensure no queens can attack each other
              </p>
            </div>
            <div className="play-step">
              <div className="play-step-number">4</div>
              <h4 className="play-step-title">Win & Score</h4>
              <p className="play-step-desc">
                Complete the puzzle to earn points and achievements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Play;
