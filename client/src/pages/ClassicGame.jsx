import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Trophy, 
  Clock, 
  Move, 
  Zap, 
  Target,
  Home, 
  RotateCcw, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Lightbulb,
  Award
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { OfflineGameStore } from '../utils/offlineStore';
import { OfflineAuth } from '../utils/offlineAuth';
import './ClassicGame.css';

const ClassicGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardSize = parseInt(searchParams.get('size')) || 8;

  // Game State
  const [board, setBoard] = useState([]);
  const [queens, setQueens] = useState([]);
  const [conflicts, setConflicts] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Game Stats
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('ready'); // 'ready', 'playing', 'won'
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [hintCell, setHintCell] = useState(null);
  
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
    setHints(3);
    setGameStatus('ready');
    setElapsedTime(0);
    setStartTime(null);
    setShowResults(false);
  }, [boardSize]);

  // Timer
  useEffect(() => {
    let interval;
    if (gameStatus === 'playing' && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus, startTime]);

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
    if (gameStatus === 'won') return;
    
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

  // Calculate score
  const calculateScore = () => {
    const baseScore = boardSize * 100;
    const timeBonus = Math.max(0, 1000 - elapsedTime * 2);
    const moveBonus = Math.max(0, 500 - moves * 10);
    const sizeBonus = (boardSize - 4) * 50;
    return Math.floor(baseScore + timeBonus + moveBonus + sizeBonus);
  };

  // Handle game won
  const handleGameWon = async () => {
    if (gameStatus === 'won') return;
    
    setGameStatus('won');
    const finalScore = calculateScore();
    setScore(finalScore);
    
    toast.success('🎉 Congratulations! You solved the puzzle!');
    
    // Save to offline store for leaderboard
    const currentUser = OfflineAuth.getCurrentUser();
    if (currentUser) {
      const gameData = {
        userId: currentUser.id,
        boardSize,
        timeElapsed: elapsedTime,
        moves,
        score: finalScore,
        hints: 3 - hints,
        solved: true,
        mode: 'classic',
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
        
        const sessionId = `classic_${boardSize}x${boardSize}_${Date.now()}`;
        
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
            timer: elapsedTime,
            moves: queens.map(([r, c]) => ({ row: r, col: c })),
            hintsUsed: 3 - hints,
            metadata: {
              mode: 'classic',
              boardSize,
              score: finalScore,
              timeElapsed: elapsedTime,
              movesCount: moves,
              completed: true
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
    
    setTimeout(() => {
      setShowResults(true);
    }, 2000);
  };

  // Use hint
  const useHint = () => {
    if (hints <= 0) {
      toast.error('No hints remaining!');
      return;
    }

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const queenExists = queens.some(([r, c]) => r === row && c === col);
        if (!queenExists) {
          const testQueens = [...queens, [row, col]];
          const testConflicts = checkConflicts(testQueens);
          if (testConflicts.size === 0) {
            setHintCell(`${row}-${col}`);
            setShowHint(true);
            setHints(hints - 1);
            setTimeout(() => {
              setShowHint(false);
              setHintCell(null);
            }, 3000);
            return;
          }
        }
      }
    }
    toast.error('No hints available for current position');
  };

  // Reset game
  const resetGame = () => {
    const newBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    setBoard(newBoard);
    setQueens([]);
    setConflicts(new Set());
    setMoves(0);
    setScore(0);
    setHints(3);
    setGameStatus('ready');
    setElapsedTime(0);
    setStartTime(null);
    setShowResults(false);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigate to leaderboard
  const goToLeaderboard = () => {
    navigate('/leaderboard?mode=classic');
  };

  return (
    <div className="classic-game">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="game-header">
        <button className="back-btn" onClick={() => navigate('/board-size-selector')}>
          <ArrowLeft size={20} />
          Change Size
        </button>
        <div className="game-title">
          <Crown size={32} color="#9333ea" />
          <h1>Classic Mode - {boardSize}×{boardSize}</h1>
        </div>
        <button className="home-btn" onClick={() => navigate('/')}>
          <Home size={20} />
        </button>
      </div>

      {/* Game Container */}
      <div className="game-container">
        {/* Left Sidebar - Stats */}
        <div className="game-sidebar left-sidebar">
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} color="#9333ea" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Board Size</span>
              <span className="stat-value">{boardSize}×{boardSize}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} color="#3b82f6" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Time</span>
              <span className="stat-value">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Move size={24} color="#f59e0b" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Moves</span>
              <span className="stat-value">{moves}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Trophy size={24} color="#10b981" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Crown size={24} color="#ec4899" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Queens</span>
              <span className="stat-value">{queens.length}/{boardSize}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Lightbulb size={24} color="#eab308" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Hints</span>
              <span className="stat-value">{hints}</span>
            </div>
          </div>
        </div>

        {/* Center - Game Board */}
        <div className="game-center">
          <div className="board-wrapper">
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
                  const isSelected = selectedCell === cellKey;
                  const isHint = showHint && hintCell === cellKey;
                  const isLight = (rowIndex + colIndex) % 2 === 0;

                  return (
                    <motion.div
                      key={cellKey}
                      className={`
                        chess-cell 
                        ${isLight ? 'light' : 'dark'}
                        ${hasQueen ? 'has-queen' : ''}
                        ${hasConflict ? 'conflict' : ''}
                        ${isSelected ? 'selected' : ''}
                        ${isHint ? 'hint' : ''}
                      `}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {hasQueen && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`queen ${hasConflict ? 'conflict-queen' : ''}`}
                        >
                          <Crown size={Math.min(40, 300 / boardSize)} />
                        </motion.div>
                      )}
                      {isHint && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="hint-indicator"
                        >
                          <Zap size={20} />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn hint-btn" onClick={useHint} disabled={hints <= 0}>
              <Lightbulb size={20} />
              Use Hint ({hints})
            </button>
            <button className="action-btn reset-btn" onClick={resetGame}>
              <RotateCcw size={20} />
              Reset
            </button>
            <button className="action-btn leaderboard-btn" onClick={goToLeaderboard}>
              <Trophy size={20} />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Right Sidebar - Instructions */}
        <div className="game-sidebar right-sidebar">
          <div className="instructions-card">
            <h3>How to Play</h3>
            <ul>
              <li>
                <CheckCircle size={16} color="#10b981" />
                Place {boardSize} queens on the board
              </li>
              <li>
                <XCircle size={16} color="#ef4444" />
                No two queens can attack each other
              </li>
              <li>
                <Target size={16} color="#3b82f6" />
                Queens attack in rows, columns, and diagonals
              </li>
              <li>
                <Clock size={16} color="#f59e0b" />
                Complete faster for bonus points
              </li>
              <li>
                <Move size={16} color="#8b5cf6" />
                Use fewer moves for higher score
              </li>
              <li>
                <Lightbulb size={16} color="#eab308" />
                Use hints wisely (3 per game)
              </li>
            </ul>
          </div>

          <div className="scoring-card">
            <h3>Scoring</h3>
            <div className="score-breakdown">
              <div className="score-item">
                <span>Base Score:</span>
                <span>{boardSize * 100}</span>
              </div>
              <div className="score-item">
                <span>Time Bonus:</span>
                <span>Max 1000</span>
              </div>
              <div className="score-item">
                <span>Move Bonus:</span>
                <span>Max 500</span>
              </div>
              <div className="score-item">
                <span>Size Bonus:</span>
                <span>{(boardSize - 4) * 50}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && gameStatus === 'won' && (
          <motion.div
            className="results-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResults(false)}
          >
            <motion.div
              className="results-modal"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="results-header">
                <Trophy size={64} color="#f59e0b" />
                <h2>Puzzle Solved! 🎉</h2>
              </div>

              <div className="results-stats">
                <div className="result-stat">
                  <Target size={32} color="#9333ea" />
                  <span className="result-label">Board Size</span>
                  <span className="result-value">{boardSize}×{boardSize}</span>
                </div>
                <div className="result-stat">
                  <Clock size={32} color="#3b82f6" />
                  <span className="result-label">Time</span>
                  <span className="result-value">{formatTime(elapsedTime)}</span>
                </div>
                <div className="result-stat">
                  <Move size={32} color="#f59e0b" />
                  <span className="result-label">Moves</span>
                  <span className="result-value">{moves}</span>
                </div>
                <div className="result-stat">
                  <Award size={32} color="#10b981" />
                  <span className="result-label">Final Score</span>
                  <span className="result-value highlight">{score}</span>
                </div>
              </div>

              <div className="results-actions">
                <button className="result-btn primary" onClick={resetGame}>
                  <RotateCcw size={20} />
                  Play Again
                </button>
                <button className="result-btn secondary" onClick={goToLeaderboard}>
                  <Trophy size={20} />
                  View Leaderboard
                </button>
                <button className="result-btn tertiary" onClick={() => navigate('/play')}>
                  <Home size={20} />
                  Main Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassicGame;
