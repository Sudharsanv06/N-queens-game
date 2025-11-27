import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import SaveManager from '../components/SaveManager';
import ConflictModal from '../components/ConflictModal';
import { useAutoSave } from '../hooks/useAutoSave';
import { useResumeOnLogin } from '../hooks/useResumeOnLogin';
import { requestHintAsync, setHintsUsed } from '../store/slices/saveSlice';
import { completeSession } from '../api/gameApi';

const PlayGameExample = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth || { user: null });
  const { lastHint, hintsRemaining, hintsUsed } = useSelector(state => state.save);
  
  const [sessionId] = useState(() => uuidv4());
  const [n, setN] = useState(8);
  const [boardState, setBoardState] = useState(() => 
    Array(8).fill(null).map(() => Array(8).fill(0))
  );
  const [moves, setMoves] = useState([]);
  const [placedQueens, setPlacedQueens] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const gameState = {
    n,
    boardState,
    moves,
    placedQueens,
    timer,
    hintsUsed
  };

  const { forceSave, isSaving } = useAutoSave(gameState, sessionId, {
    enabled: true,
    onSaveSuccess: () => {
      console.log('Auto-save successful');
    },
    onSaveError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  const { isResuming } = useResumeOnLogin(sessionId, {
    autoResumeEnabled: true,
    onResumeSuccess: (save) => {
      console.log('Game resumed:', save);
      setN(save.n);
      setBoardState(save.boardState);
      setMoves(save.moves);
      setPlacedQueens(save.placedQueens);
      setTimer(save.timer);
      dispatch(setHintsUsed(save.hintsUsed));
    },
    onConflictDetected: (conflict) => {
      console.log('Conflict detected:', conflict);
    }
  });

  useEffect(() => {
    let interval;
    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        setTimer(prev => prev + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, isComplete]);

  const handleCellClick = async (row, col) => {
    if (isComplete) return;

    const newBoard = boardState.map(r => [...r]);
    const newMoves = [...moves];
    const timestamp = new Date();

    if (newBoard[row][col] === 0) {
      newBoard[row][col] = 1;
      newMoves.push({ row, col, action: 'place', timestamp });
      setPlacedQueens(prev => prev + 1);

      if (placedQueens + 1 === n) {
        if (isValidSolution(newBoard, n)) {
          setIsComplete(true);
          setIsRunning(false);
          await handleGameComplete();
        }
      }
    } else {
      newBoard[row][col] = 0;
      newMoves.push({ row, col, action: 'remove', timestamp });
      setPlacedQueens(prev => prev - 1);
    }

    setBoardState(newBoard);
    setMoves(newMoves);

    if (!isRunning) {
      setIsRunning(true);
    }

    await forceSave();
  };

  const isValidSolution = (board, size) => {
    for (let i = 0; i < size; i++) {
      let rowSum = 0, colSum = 0;
      for (let j = 0; j < size; j++) {
        rowSum += board[i][j];
        colSum += board[j][i];
      }
      if (rowSum !== 1 || colSum !== 1) return false;
    }

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 1) {
          for (let k = 0; k < size; k++) {
            for (let l = 0; l < size; l++) {
              if ((k !== i || l !== j) && board[k][l] === 1) {
                if (Math.abs(i - k) === Math.abs(j - l)) {
                  return false;
                }
              }
            }
          }
        }
      }
    }
    return true;
  };

  const handleGameComplete = async () => {
    try {
      const analytics = {
        totalTime: timer,
        movesCount: moves.length,
        wrongMoves: moves.filter(m => m.action === 'remove').length,
        correctMoves: moves.filter(m => m.action === 'place').length
      };

      await completeSession(sessionId, analytics);
      console.log('Session completed!');
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  const handleRequestHint = async () => {
    if (hintsRemaining <= 0) {
      alert('No hints remaining!');
      return;
    }

    try {
      await dispatch(requestHintAsync({
        sessionId,
        boardState,
        n
      })).unwrap();
      
      setShowHint(true);
      setTimeout(() => setShowHint(false), 5000);
      
      await forceSave();
    } catch (error) {
      alert(error.message || 'Failed to get hint');
    }
  };

  const handleLoadGame = (save) => {
    setN(save.n);
    setBoardState(save.boardState);
    setMoves(save.moves);
    setPlacedQueens(save.placedQueens);
    setTimer(save.timer);
    dispatch(setHintsUsed(save.hintsUsed));
    setIsComplete(false);
    setIsRunning(false);
  };

  const handleNewGame = (size) => {
    setN(size);
    setBoardState(Array(size).fill(null).map(() => Array(size).fill(0)));
    setMoves([]);
    setPlacedQueens(0);
    setTimer(0);
    setIsRunning(false);
    setIsComplete(false);
    dispatch(setHintsUsed(0));
  };

  const handlePause = () => {
    setIsRunning(false);
    forceSave();
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isResuming) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Resuming your game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <SaveManager 
          gameState={gameState}
          sessionId={sessionId}
          onLoadGame={handleLoadGame}
        />

        <ConflictModal onResolve={handleLoadGame} />

        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">N-Queens Game ({n}×{n})</h1>
            <div className="flex gap-2">
              <button
                onClick={() => handleNewGame(8)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                New 8×8
              </button>
              <button
                onClick={() => handleNewGame(10)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                New 10×10
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Queens Placed: {placedQueens} / {n}
              </p>
              <p className="text-sm text-gray-600">
                Time: {formatTime(timer)}
              </p>
              <p className="text-sm text-gray-600">
                Moves: {moves.length}
              </p>
            </div>

            <div className="space-x-2">
              {!isRunning && !isComplete ? (
                <button
                  onClick={handleResume}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  disabled={isComplete}
                >
                  Pause
                </button>
              )}

              <button
                onClick={handleRequestHint}
                disabled={hintsRemaining <= 0 || isComplete}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
              >
                Hint ({hintsRemaining})
              </button>
            </div>
          </div>

          {showHint && lastHint && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded">
              <p className="text-sm font-semibold text-purple-800">
                Hint: Try row {lastHint.row + 1}, column {lastHint.col + 1}
              </p>
              <p className="text-xs text-purple-600 mt-1">{lastHint.reasoning}</p>
            </div>
          )}

          {isComplete && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-lg font-bold text-green-800">
                🎉 Congratulations! You solved the {n}×{n} puzzle!
              </p>
              <p className="text-sm text-green-600 mt-1">
                Time: {formatTime(timer)} | Moves: {moves.length} | Hints: {hintsUsed}
              </p>
            </div>
          )}

          <div className="grid gap-1" style={{ 
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            aspectRatio: '1'
          }}>
            {boardState.map((row, i) => (
              row.map((cell, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  disabled={isComplete}
                  className={`
                    aspect-square border border-gray-300 flex items-center justify-center
                    transition-colors text-2xl
                    ${(i + j) % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                    ${cell === 1 ? 'bg-blue-500 text-white' : ''}
                    ${showHint && lastHint && lastHint.row === i && lastHint.col === j ? 'ring-2 ring-purple-500' : ''}
                    hover:bg-blue-200
                    disabled:cursor-not-allowed
                  `}
                >
                  {cell === 1 ? '♛' : ''}
                </button>
              ))
            ))}
          </div>

          {isSaving && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Saving game...
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-semibold mb-2">How to Play:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Place {n} queens on the board</li>
            <li>No two queens can threaten each other</li>
            <li>Queens threaten horizontally, vertically, and diagonally</li>
            <li>Use hints if you get stuck (3 per game)</li>
            <li>Your progress is auto-saved every 10 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayGameExample;
