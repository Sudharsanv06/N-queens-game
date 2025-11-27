import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, RotateCcw, Lightbulb, Flag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PuzzleTimer from '../components/PuzzleTimer';
import PuzzleStatsBar from '../components/PuzzleStatsBar';
import {
  fetchPuzzle,
  startPuzzleAttempt,
  completePuzzleAttempt,
  clearCurrentPuzzle
} from '../store/slices/puzzleSlice';

const PuzzlePlay = () => {
  const { puzzleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentPuzzle, currentAttempt, loading, attemptCompleted } = useSelector(
    (state) => state.puzzle
  );

  const [board, setBoard] = useState([]);
  const [lockedPositions, setLockedPositions] = useState([]);
  const [movesUsed, setMovesUsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);

  // Initialize puzzle
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to play puzzles');
      navigate('/login');
      return;
    }

    dispatch(fetchPuzzle(puzzleId));
    dispatch(startPuzzleAttempt(puzzleId));

    return () => {
      dispatch(clearCurrentPuzzle());
    };
  }, [dispatch, puzzleId, isAuthenticated, navigate]);

  // Setup board when puzzle loads
  useEffect(() => {
    if (currentPuzzle && currentAttempt) {
      const n = currentPuzzle.n;
      const newBoard = Array(n)
        .fill(null)
        .map(() => Array(n).fill(false));

      // Place initial queens
      const locked = [];
      currentPuzzle.initialQueens.forEach(({ row, col }) => {
        newBoard[row][col] = true;
        locked.push({ row, col });
      });

      setBoard(newBoard);
      setLockedPositions(locked);
      setMovesUsed(currentAttempt.movesUsed || 0);
      setHintsUsed(currentAttempt.hintsUsed || 0);
    }
  }, [currentPuzzle, currentAttempt]);

  // Handle attempt completed
  useEffect(() => {
    if (attemptCompleted && currentAttempt) {
      navigate(`/puzzles/${puzzleId}/completed`, {
        state: { attempt: currentAttempt, puzzle: currentPuzzle }
      });
    }
  }, [attemptCompleted, currentAttempt, currentPuzzle, puzzleId, navigate]);

  const isLocked = useCallback(
    (row, col) => {
      return lockedPositions.some((pos) => pos.row === row && pos.col === col);
    },
    [lockedPositions]
  );

  const toggleQueen = useCallback(
    (row, col) => {
      if (isLocked(row, col)) {
        toast.error('This queen is locked!');
        return;
      }

      setBoard((prevBoard) => {
        const newBoard = prevBoard.map((r) => [...r]);
        newBoard[row][col] = !newBoard[row][col];
        return newBoard;
      });

      setMovesUsed((prev) => prev + 1);
    },
    [isLocked]
  );

  const checkSolution = useCallback(() => {
    const n = board.length;
    const queens = [];

    // Find all queens
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (board[row][col]) {
          queens.push({ row, col });
        }
      }
    }

    // Must have exactly n queens
    if (queens.length !== n) {
      return false;
    }

    // Check conflicts
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const q1 = queens[i];
        const q2 = queens[j];

        // Same row
        if (q1.row === q2.row) return false;

        // Same column
        if (q1.col === q2.col) return false;

        // Same diagonal
        if (Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)) {
          return false;
        }
      }
    }

    return true;
  }, [board]);

  const handleComplete = useCallback(async () => {
    const isSolved = checkSolution();

    if (!isSolved) {
      toast.error('Solution is not correct! Keep trying.');
      return;
    }

    const queens = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col]) {
          queens.push({ row, col });
        }
      }
    }

    const attemptData = {
      solved: true,
      timeTaken: elapsedTime,
      movesUsed,
      hintsUsed,
      boardState: {
        queens,
        lockedQueens: lockedPositions
      }
    };

    try {
      await dispatch(
        completePuzzleAttempt({ puzzleId, attemptData })
      ).unwrap();
      toast.success('Puzzle solved! 🎉');
    } catch (error) {
      toast.error('Failed to save completion: ' + error);
    }
  }, [
    board,
    checkSolution,
    elapsedTime,
    movesUsed,
    hintsUsed,
    lockedPositions,
    dispatch,
    puzzleId
  ]);

  const handleGiveUp = async () => {
    const queens = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col]) {
          queens.push({ row, col });
        }
      }
    }

    const attemptData = {
      solved: false,
      timeTaken: elapsedTime,
      movesUsed,
      hintsUsed,
      boardState: {
        queens,
        lockedQueens: lockedPositions
      }
    };

    try {
      await dispatch(
        completePuzzleAttempt({ puzzleId, attemptData })
      ).unwrap();
      toast('Puzzle ended. Better luck next time!');
      navigate('/puzzles');
    } catch (error) {
      toast.error('Failed to save attempt');
    }
  };

  const handleHint = useCallback(() => {
    if (hintsUsed >= (currentPuzzle?.maxHints || 3)) {
      toast.error('No more hints available!');
      return;
    }

    // Simple hint: suggest an empty safe square
    const n = board.length;
    const queens = [];
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (board[row][col]) queens.push({ row, col });
      }
    }

    // Find a safe square
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (board[row][col] || isLocked(row, col)) continue;

        // Check if this position is safe
        let isSafe = true;
        for (const queen of queens) {
          if (
            queen.row === row ||
            queen.col === col ||
            Math.abs(queen.row - row) === Math.abs(queen.col - col)
          ) {
            isSafe = false;
            break;
          }
        }

        if (isSafe) {
          toast.success(`Hint: Try row ${row + 1}, column ${col + 1}`, {
            duration: 4000
          });
          setHintsUsed((prev) => prev + 1);
          return;
        }
      }
    }

    toast('No obvious hints available. Keep exploring!');
  }, [board, hintsUsed, currentPuzzle, isLocked]);

  const handleReset = useCallback(() => {
    if (currentPuzzle) {
      const n = currentPuzzle.n;
      const newBoard = Array(n)
        .fill(null)
        .map(() => Array(n).fill(false));

      currentPuzzle.initialQueens.forEach(({ row, col }) => {
        newBoard[row][col] = true;
      });

      setBoard(newBoard);
      setMovesUsed((prev) => prev + 1); // Count reset as a move
    }
  }, [currentPuzzle]);

  const getQueensPlaced = useCallback(() => {
    return board.reduce((count, row) => {
      return count + row.reduce((rowCount, cell) => rowCount + (cell ? 1 : 0), 0);
    }, 0);
  }, [board]);

  if (loading || !currentPuzzle || board.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  const n = board.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate('/puzzles')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Puzzles</span>
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentPuzzle.puzzleName}
            </h1>
            <p className="text-sm text-gray-600">{currentPuzzle.difficulty}</p>
          </div>

          <div className="w-32" /> {/* Spacer for centering */}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Timer & Stats */}
          <div className="space-y-4">
            <PuzzleTimer
              startTime={currentAttempt?.startTime}
              isActive={true}
              expectedTime={currentPuzzle.expectedMinTime}
              onTimeUpdate={setElapsedTime}
            />

            <PuzzleStatsBar
              movesUsed={movesUsed}
              hintsUsed={hintsUsed}
              maxHints={currentPuzzle.maxHints}
              queensPlaced={getQueensPlaced()}
              totalQueens={n}
            />

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={handleHint}
                disabled={hintsUsed >= currentPuzzle.maxHints}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  hintsUsed >= currentPuzzle.maxHints
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
                <span>Get Hint ({hintsUsed}/{currentPuzzle.maxHints})</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset Board</span>
              </button>

              <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all"
              >
                <Flag className="w-5 h-5" />
                <span>Check Solution</span>
              </button>

              <button
                onClick={() => setShowGiveUpModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-all"
              >
                <X className="w-5 h-5" />
                <span>Give Up</span>
              </button>
            </div>
          </div>

          {/* Center - Board */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-6 border-4 border-purple-200"
            >
              <div
                className="grid gap-1 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
                  maxWidth: '600px'
                }}
              >
                {board.map((row, rowIndex) =>
                  row.map((hasQueen, colIndex) => {
                    const isDark = (rowIndex + colIndex) % 2 === 1;
                    const locked = isLocked(rowIndex, colIndex);

                    return (
                      <motion.button
                        key={`${rowIndex}-${colIndex}`}
                        whileHover={{ scale: locked ? 1 : 1.1 }}
                        whileTap={{ scale: locked ? 1 : 0.95 }}
                        onClick={() => toggleQueen(rowIndex, colIndex)}
                        className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl transition-all ${
                          isDark ? 'bg-purple-200' : 'bg-purple-50'
                        } ${
                          locked
                            ? 'cursor-not-allowed opacity-80 ring-2 ring-blue-500'
                            : 'hover:bg-purple-300 cursor-pointer'
                        } ${hasQueen ? 'text-purple-700 font-bold' : 'text-transparent'}`}
                        disabled={locked}
                      >
                        {hasQueen ? '♛' : ''}
                      </motion.button>
                    );
                  })
                )}
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                <p>
                  🔒 Blue outlined queens are locked. Click empty squares to place
                  queens.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Give Up Modal */}
      {showGiveUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Give Up?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to give up on this puzzle? Your progress will be
              saved but marked as incomplete.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowGiveUpModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Keep Playing
              </button>
              <button
                onClick={handleGiveUp}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Give Up
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PuzzlePlay;
