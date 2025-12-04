import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Trophy, 
  Move, 
  Zap, 
  Target,
  Home, 
  RotateCcw, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Timer
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { OfflineGameStore } from '../utils/offlineStore';
import { OfflineAuth } from '../utils/offlineAuth';
import './TimeTrialGame.css';

const TimeTrialGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardSize = parseInt(searchParams.get('size')) || 8;
  const timeLimit = parseInt(searchParams.get('time')) || 180; // in seconds

  // Game State
  const [board, setBoard] = useState([]);
  const [queens, setQueens] = useState([]);
  const [conflicts, setConflicts] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Game Stats
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('ready'); // 'ready', 'playing', 'won', 'lost'
  
  // User State
  const [user, setUser] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Initialize user
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
  }, []);

  // Initialize board
  useEffect(() => {
    const newBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    setBoard(newBoard);
    setQueens([]);
    setConflicts(new Set());
    setMoves(0);
    setScore(0);
    setGameStatus('ready');
    setTimeRemaining(timeLimit);
    setStartTime(null);
    setShowResults(false);
  }, [boardSize, timeLimit]);

  // Countdown Timer (reverse)
  useEffect(() => {
    let interval;
    if (gameStatus === 'playing' && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = timeLimit - elapsed;
        
        if (remaining <= 0) {
          setTimeRemaining(0);
          handleTimeUp();
        } else {
          setTimeRemaining(remaining);
        }
      }, 100); // Update more frequently for smoother countdown
    }
    return () => clearInterval(interval);
  }, [gameStatus, startTime, timeLimit]);

  // Check for conflicts
  const checkConflicts = useCallback((queensPositions) => {
    const newConflicts = new Set();
    
    for (let i = 0; i < queensPositions.length; i++) {
      const [row1, col1] = queensPositions[i];
      
      for (let j = i + 1; j < queensPositions.length; j++) {
        const [row2, col2] = queensPositions[j];
        
        if (
          row1 === row2 || 
          col1 === col2 || 
          Math.abs(row1 - row2) === Math.abs(col1 - col2)
        ) {
          newConflicts.add(`${row1}-${col1}`);
          newConflicts.add(`${row2}-${col2}`);
        }
      }
    }
    
    return newConflicts;
  }, []);

  // Check if game is won
  useEffect(() => {
    if (queens.length === boardSize && conflicts.size === 0 && gameStatus === 'playing') {
      handleGameWon();
    }
  }, [queens, conflicts, boardSize, gameStatus]);

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    
    // Start the game on first click
    if (gameStatus === 'ready') {
      setGameStatus('playing');
      setStartTime(Date.now());
    }

    const cellKey = `${row}-${col}`;
    const queenIndex = queens.findIndex(([r, c]) => r === row && c === col);

    if (queenIndex !== -1) {
      // Remove queen
      const newQueens = queens.filter((_, i) => i !== queenIndex);
      setQueens(newQueens);
      setConflicts(checkConflicts(newQueens));
    } else {
      // Add queen
      const newQueens = [...queens, [row, col]];
      setQueens(newQueens);
      setConflicts(checkConflicts(newQueens));
      setMoves(moves + 1);
    }

    setSelectedCell(cellKey);
    setTimeout(() => setSelectedCell(null), 300);
  };

  // Calculate score with time bonus
  const calculateScore = () => {
    const baseScore = boardSize * 150;
    const timeBonus = timeRemaining * 5; // More bonus for remaining time
    const moveBonus = Math.max(0, 500 - moves * 10);
    const sizeBonus = (boardSize - 4) * 75;
    const speedMultiplier = timeRemaining > timeLimit * 0.5 ? 1.5 : 1.2;
    
    return Math.floor((baseScore + timeBonus + moveBonus + sizeBonus) * speedMultiplier);
  };

  // Handle game won
  const handleGameWon = async () => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    
    setGameStatus('won');
    const finalScore = calculateScore();
    setScore(finalScore);
    
    toast.success('🎉 Puzzle solved! You beat the clock!');
    
    await saveGameToBackend(finalScore, true);
    
    setTimeout(() => {
      setShowResults(true);
    }, 2000);
  };

  // Handle time up
  const handleTimeUp = async () => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    
    setGameStatus('lost');
    setScore(0);
    
    toast.error('⏰ Time\'s up! Try again!');
    
    await saveGameToBackend(0, false);
    
    setTimeout(() => {
      setShowResults(true);
    }, 2000);
  };

  // Save game to backend
  const saveGameToBackend = async (finalScore, completed) => {
    // Save to offline store for leaderboard
    const currentUser = OfflineAuth.getCurrentUser();
    if (currentUser) {
      const gameData = {
        userId: currentUser.id,
        boardSize,
        timeElapsed: timeLimit - timeRemaining,
        moves,
        score: finalScore,
        solved: completed,
        mode: 'time-trial',
        timeLimit,
        completedAt: new Date().toISOString()
      };
      
      OfflineGameStore.saveGame(gameData);
      console.log('✅ Game saved to offline store:', gameData);
      
      // Dispatch custom event to refresh leaderboard
      window.dispatchEvent(new CustomEvent('gameCompleted', { detail: gameData }));
    }
    
    // Save score to backend
    if (user) {
      try {
        const token = localStorage.getItem('token');
        
        // Create board state as 2D array with queen positions
        const boardState = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
        queens.forEach(([row, col]) => {
          boardState[row][col] = 1;
        });
        
        const sessionId = `timetrial_${boardSize}x${boardSize}_${Date.now()}`;
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/saves/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sessionId,
            n: boardSize,
            boardState,
            timer: timeLimit - timeRemaining,
            moves: queens.map(([r, c]) => ({ row: r, col: c })),
            hintsUsed: 0,
            metadata: {
              mode: 'time-trial',
              boardSize,
              score: finalScore,
              timeLimit,
              timeRemaining,
              movesCount: moves,
              completed
            }
          })
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('Score saved successfully:', data);
        }
      } catch (error) {
        console.error('Failed to save score:', error);
      }
    }
  };

  // Reset game
  const resetGame = () => {
    const newBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    setBoard(newBoard);
    setQueens([]);
    setConflicts(new Set());
    setMoves(0);
    setScore(0);
    setGameStatus('ready');
    setTimeRemaining(timeLimit);
    setStartTime(null);
    setShowResults(false);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    const percentage = (timeRemaining / timeLimit) * 100;
    if (percentage > 50) return '#10b981'; // green
    if (percentage > 25) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  // Navigate to leaderboard
  const goToLeaderboard = () => {
    navigate('/leaderboard?mode=time-trial');
  };

  return (
    <div className="classic-game time-trial-game">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="game-header">
        <button className="back-btn" onClick={() => navigate('/time-trial-selector')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="game-title">
          <Clock className="title-icon" size={28} />
          <div>
            <h1>Time Trial - {boardSize}×{boardSize}</h1>
            <p className="mode-subtitle">Beat the Clock!</p>
          </div>
        </div>
        <button className="home-btn" onClick={() => navigate('/')}>
          <Home size={20} />
        </button>
      </div>

      <div className="game-container">
        {/* Game Board Section */}
        <div className="game-board-section">
          {/* Stats Bar */}
          <div className="stats-bar time-trial-stats">
            <div className={`stat-item time-stat ${timeRemaining <= 30 ? 'critical' : timeRemaining <= 60 ? 'warning' : ''}`}>
              <Timer size={24} style={{ color: getTimeColor() }} />
              <div className="stat-content">
                <span className="stat-label">Time Left</span>
                <span className="stat-value" style={{ color: getTimeColor() }}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <div className="stat-item">
              <Move size={24} color="#3b82f6" />
              <div className="stat-content">
                <span className="stat-label">Moves</span>
                <span className="stat-value">{moves}</span>
              </div>
            </div>
            <div className="stat-item">
              <Target size={24} color="#10b981" />
              <div className="stat-content">
                <span className="stat-label">Queens</span>
                <span className="stat-value">{queens.length}/{boardSize}</span>
              </div>
            </div>
            <div className="stat-item">
              <Trophy size={24} color="#f59e0b" />
              <div className="stat-content">
                <span className="stat-label">Score</span>
                <span className="stat-value">{score}</span>
              </div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="board-container">
            <div 
              className="chess-board"
              style={{
                gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                gridTemplateRows: `repeat(${boardSize}, 1fr)`
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((_, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  const hasQueen = queens.some(([r, c]) => r === rowIndex && c === colIndex);
                  const hasConflict = conflicts.has(cellKey);
                  const isLight = (rowIndex + colIndex) % 2 === 0;
                  const isSelected = selectedCell === cellKey;

                  return (
                    <motion.div
                      key={cellKey}
                      className={`chess-cell ${isLight ? 'light' : 'dark'} ${hasQueen ? 'has-queen' : ''} ${hasConflict ? 'conflict' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      whileHover={{ scale: gameStatus === 'playing' || gameStatus === 'ready' ? 1.05 : 1 }}
                      whileTap={{ scale: gameStatus === 'playing' || gameStatus === 'ready' ? 0.95 : 1 }}
                    >
                      {hasQueen && (
                        <motion.div
                          className="queen-piece"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          ♛
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Time Warning Overlay */}
            {timeRemaining <= 10 && timeRemaining > 0 && gameStatus === 'playing' && (
              <motion.div
                className="time-warning-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AlertTriangle size={48} color="#ef4444" />
                <p>HURRY UP!</p>
                <p className="time-warning-text">{timeRemaining}s left</p>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn reset-btn" onClick={resetGame}>
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="side-panel">
          {/* Status Card */}
          <div className="status-card">
            <h3>Game Status</h3>
            <div className="status-content">
              {gameStatus === 'ready' && (
                <div className="status-message ready">
                  <Target size={32} color="#3b82f6" />
                  <p>Click any cell to start!</p>
                </div>
              )}
              {gameStatus === 'playing' && (
                <div className="status-message playing">
                  <Zap size={32} color="#f59e0b" />
                  <p>Race against time!</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${(timeRemaining / timeLimit) * 100}%`,
                        background: getTimeColor()
                      }}
                    />
                  </div>
                </div>
              )}
              {gameStatus === 'won' && (
                <div className="status-message won">
                  <CheckCircle size={32} color="#10b981" />
                  <p>Puzzle Solved!</p>
                  <p className="score-display">Score: {score}</p>
                </div>
              )}
              {gameStatus === 'lost' && (
                <div className="status-message lost">
                  <XCircle size={32} color="#ef4444" />
                  <p>Time's Up!</p>
                  <p className="retry-message">Try again!</p>
                </div>
              )}
            </div>
          </div>

          {/* Rules Card */}
          <div className="rules-card">
            <h3>Rules</h3>
            <ul>
              <li>Place {boardSize} queens on the board</li>
              <li>No two queens can attack each other</li>
              <li>Queens attack horizontally, vertically, and diagonally</li>
              <li>Complete before time runs out!</li>
              <li>Faster completion = Higher score</li>
            </ul>
          </div>

          {/* Tips Card */}
          <div className="tips-card">
            <h3>💡 Tips</h3>
            <ul>
              <li>Work quickly but carefully</li>
              <li>Plan your queen placements</li>
              <li>Keep track of remaining time</li>
              <li>Time bonus for fast completion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            className="results-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="results-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className={`results-header ${gameStatus === 'won' ? 'won' : 'lost'}`}>
                {gameStatus === 'won' ? (
                  <>
                    <Trophy size={48} />
                    <h2>Victory!</h2>
                    <p>You beat the clock!</p>
                  </>
                ) : (
                  <>
                    <Clock size={48} />
                    <h2>Time's Up!</h2>
                    <p>Better luck next time!</p>
                  </>
                )}
              </div>

              <div className="results-stats">
                {gameStatus === 'won' && (
                  <div className="result-stat">
                    <Trophy className="result-icon" />
                    <div>
                      <span className="result-label">Final Score</span>
                      <span className="result-value">{score}</span>
                    </div>
                  </div>
                )}
                <div className="result-stat">
                  <Timer className="result-icon" />
                  <div>
                    <span className="result-label">Time Used</span>
                    <span className="result-value">{formatTime(timeLimit - timeRemaining)}</span>
                  </div>
                </div>
                <div className="result-stat">
                  <Move className="result-icon" />
                  <div>
                    <span className="result-label">Total Moves</span>
                    <span className="result-value">{moves}</span>
                  </div>
                </div>
                <div className="result-stat">
                  <Target className="result-icon" />
                  <div>
                    <span className="result-label">Board Size</span>
                    <span className="result-value">{boardSize}×{boardSize}</span>
                  </div>
                </div>
              </div>

              <div className="results-actions">
                <button className="result-btn primary" onClick={resetGame}>
                  <RotateCcw size={20} />
                  Play Again
                </button>
                <button className="result-btn secondary" onClick={goToLeaderboard}>
                  <Trophy size={20} />
                  Leaderboard
                </button>
                <button className="result-btn secondary" onClick={() => navigate('/time-trial-selector')}>
                  <ArrowLeft size={20} />
                  Change Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeTrialGame;
