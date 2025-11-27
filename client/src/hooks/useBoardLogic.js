// client/src/hooks/useBoardLogic.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  toggleQueen,
  resetBoard,
  setBoardSize,
  toggleSafeCells,
  toggleAttackedCells,
  useHint,
  undoMove,
  initializeGame,
  toggleSound,
  setSoundEnabled,
  setSoundVolume,
  startTimer,
  stopTimer,
  resetTimer,
  selectBoardSize,
  selectQueens,
  selectAttackedCells,
  selectSafeCells,
  selectIsComplete,
  selectShowSafeCells,
  selectShowAttackedCells,
  selectHintsUsed,
  selectScore,
  selectPlacedQueensCount,
  selectSoundEnabled,
  selectSoundVolume,
  selectTimerRunning,
  selectTimerElapsed,
  selectMoveHistory
} from '../store/slices/boardGameSlice';
import { getHint, isSafePlacement } from '../utils/boardHelpers';

/**
 * Custom hook for N-Queens board logic
 * Provides all game state and actions for components
 */
export const useBoardLogic = () => {
  const dispatch = useDispatch();

  // Selectors
  const boardSize = useSelector(selectBoardSize);
  const queens = useSelector(selectQueens);
  const attackedCells = useSelector(selectAttackedCells);
  const safeCells = useSelector(selectSafeCells);
  const isComplete = useSelector(selectIsComplete);
  const showSafeCells = useSelector(selectShowSafeCells);
  const showAttackedCells = useSelector(selectShowAttackedCells);
  const hintsUsed = useSelector(selectHintsUsed);
  const score = useSelector(selectScore);
  const placedQueensCount = useSelector(selectPlacedQueensCount);
  const soundEnabled = useSelector(selectSoundEnabled);
  const soundVolume = useSelector(selectSoundVolume);
  const timerRunning = useSelector(selectTimerRunning);
  const timerElapsed = useSelector(selectTimerElapsed);
  const moveHistory = useSelector(selectMoveHistory);

  // Actions
  const handleCellClick = useCallback((row, col) => {
    dispatch(toggleQueen({ row, col }));
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(resetBoard());
  }, [dispatch]);

  const handleBoardSizeChange = useCallback((newSize) => {
    dispatch(setBoardSize(newSize));
  }, [dispatch]);

  const handleToggleSafeCells = useCallback(() => {
    dispatch(toggleSafeCells());
  }, [dispatch]);

  const handleToggleAttackedCells = useCallback(() => {
    dispatch(toggleAttackedCells());
  }, [dispatch]);

  const handleUseHint = useCallback(() => {
    dispatch(useHint());
  }, [dispatch]);

  const handleUndo = useCallback(() => {
    dispatch(undoMove());
  }, [dispatch]);

  const handleInitialize = useCallback((size) => {
    dispatch(initializeGame(size));
  }, [dispatch]);

  const handleToggleSound = useCallback(() => {
    dispatch(toggleSound());
  }, [dispatch]);

  const handleSetSoundEnabled = useCallback((enabled) => {
    dispatch(setSoundEnabled(enabled));
  }, [dispatch]);

  const handleSetSoundVolume = useCallback((volume) => {
    dispatch(setSoundVolume(volume));
  }, [dispatch]);

  const handleStartTimer = useCallback(() => {
    dispatch(startTimer());
  }, [dispatch]);

  const handleStopTimer = useCallback(() => {
    dispatch(stopTimer());
  }, [dispatch]);

  const handleResetTimer = useCallback(() => {
    dispatch(resetTimer());
  }, [dispatch]);

  // Helper functions
  const isQueenPlaced = useCallback((row, col) => {
    return queens[row] === col;
  }, [queens]);

  const isCellAttacked = useCallback((row, col) => {
    return attackedCells.includes(`${row},${col}`);
  }, [attackedCells]);

  const isCellSafe = useCallback((row, col) => {
    return safeCells.includes(`${row},${col}`);
  }, [safeCells]);

  const canPlaceQueen = useCallback((row, col) => {
    // If there's already a queen in this row, can remove it
    if (queens[row] !== -1) return true;
    
    // Otherwise check if placement is safe
    return isSafePlacement(queens, row, col);
  }, [queens]);

  const getCurrentHint = useCallback(() => {
    return getHint(queens, boardSize);
  }, [queens, boardSize]);

  // Memoized computed values
  const progress = useMemo(() => {
    return {
      placed: placedQueensCount,
      total: boardSize,
      percentage: Math.round((placedQueensCount / boardSize) * 100)
    };
  }, [placedQueensCount, boardSize]);

  const gameStatus = useMemo(() => {
    if (isComplete) return 'complete';
    if (placedQueensCount === 0) return 'not-started';
    return 'in-progress';
  }, [isComplete, placedQueensCount]);

  return {
    // State
    boardSize,
    queens,
    attackedCells,
    safeCells,
    isComplete,
    showSafeCells,
    showAttackedCells,
    hintsUsed,
    score,
    placedQueensCount,
    progress,
    gameStatus,
    soundEnabled,
    soundVolume,
    timerRunning,
    timerElapsed,
    moveHistory,

    // Actions
    handleCellClick,
    handleReset,
    handleBoardSizeChange,
    handleToggleSafeCells,
    handleToggleAttackedCells,
    handleUseHint,
    handleUndo,
    handleInitialize,
    handleToggleSound,
    handleSetSoundEnabled,
    handleSetSoundVolume,
    handleStartTimer,
    handleStopTimer,
    handleResetTimer,

    // Helper functions
    isQueenPlaced,
    isCellAttacked,
    isCellSafe,
    canPlaceQueen,
    getCurrentHint
  };
};
