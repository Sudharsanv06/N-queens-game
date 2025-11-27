// client/src/store/slices/boardGameSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  initializeBoard,
  isSafePlacement,
  getAttackedCells,
  getSafeCells,
  isValidSolution,
  calculateScore,
  countPlacedQueens,
  getHint
} from '../../utils/boardHelpers';

const initialState = {
  boardSize: 8,
  queens: initializeBoard(8),
  attackedCells: new Set(),
  safeCells: new Set(),
  isComplete: false,
  showSafeCells: false,
  showAttackedCells: true,
  hintsUsed: 0,
  startTime: null,
  endTime: null,
  score: 0,
  moveHistory: [],
  gameMode: 'classic', // classic, time-trial, puzzle
  
  // Timer state
  timerRunning: false,
  timerElapsed: 0, // seconds
  timerStartTime: null,
  
  // Sound settings
  soundEnabled: true,
  soundVolume: 0.5,
  lastPlayedSound: null,
};

const boardGameSlice = createSlice({
  name: 'boardGame',
  initialState,
  reducers: {
    // Initialize or reset board
    initializeGame: (state, action) => {
      const size = action.payload || state.boardSize;
      state.boardSize = size;
      state.queens = initializeBoard(size);
      state.attackedCells = new Set();
      state.safeCells = new Set();
      state.isComplete = false;
      state.hintsUsed = 0;
      state.startTime = Date.now();
      state.endTime = null;
      state.score = 0;
      state.moveHistory = [];
      state.timerRunning = true;
      state.timerElapsed = 0;
      state.timerStartTime = Date.now();
    },

    // Reset current board
    resetBoard: (state) => {
      state.queens = initializeBoard(state.boardSize);
      state.attackedCells = new Set();
      state.safeCells = new Set();
      state.isComplete = false;
      state.hintsUsed = 0;
      state.startTime = Date.now();
      state.endTime = null;
      state.score = 0;
      state.moveHistory = [];
      state.timerRunning = true;
      state.timerElapsed = 0;
      state.timerStartTime = Date.now();
    },

    // Place or remove queen
    toggleQueen: (state, action) => {
      const { row, col } = action.payload;
      
      // If there's already a queen in this row, remove it
      if (state.queens[row] !== -1) {
        state.moveHistory.push({
          type: 'remove',
          row,
          col: state.queens[row],
          timestamp: Date.now()
        });
        state.queens[row] = -1;
      } else {
        // Check if placement is safe
        if (isSafePlacement(state.queens, row, col)) {
          state.queens[row] = col;
          state.moveHistory.push({
            type: 'place',
            row,
            col,
            timestamp: Date.now()
          });
        } else {
          // Invalid placement - do nothing (could add error feedback here)
          return;
        }
      }

      // Update attacked and safe cells
      const attackedArray = Array.from(
        getAttackedCells(state.queens, state.boardSize)
      );
      const safeArray = Array.from(
        getSafeCells(state.queens, state.boardSize)
      );
      
      state.attackedCells = attackedArray;
      state.safeCells = safeArray;

      // Check if game is complete
      const placedCount = countPlacedQueens(state.queens);
      if (placedCount === state.boardSize) {
        state.isComplete = isValidSolution(state.queens, state.boardSize);
        
        if (state.isComplete) {
          state.endTime = Date.now();
          const timeElapsed = Math.floor((state.endTime - state.startTime) / 1000);
          state.score = calculateScore(state.boardSize, timeElapsed, state.hintsUsed);
          
          // Stop timer when game is complete
          state.timerRunning = false;
          state.timerElapsed = timeElapsed;
        }
      } else {
        state.isComplete = false;
      }
    },

    // Change board size
    setBoardSize: (state, action) => {
      const newSize = action.payload;
      if (newSize >= 4 && newSize <= 20) {
        state.boardSize = newSize;
        state.queens = initializeBoard(newSize);
        state.attackedCells = new Set();
        state.safeCells = new Set();
        state.isComplete = false;
        state.hintsUsed = 0;
        state.startTime = Date.now();
        state.endTime = null;
        state.score = 0;
        state.moveHistory = [];
      }
    },

    // Toggle safe cells visibility
    toggleSafeCells: (state) => {
      state.showSafeCells = !state.showSafeCells;
    },

    // Toggle attacked cells visibility
    toggleAttackedCells: (state) => {
      state.showAttackedCells = !state.showAttackedCells;
    },

    // Use hint
    useHint: (state) => {
      const hint = getHint(state.queens, state.boardSize);
      if (hint) {
        state.hintsUsed += 1;
        // The hint will be displayed in the UI, not automatically placed
      }
    },

    // Undo last move
    undoMove: (state) => {
      if (state.moveHistory.length === 0) return;
      
      const lastMove = state.moveHistory.pop();
      
      if (lastMove.type === 'place') {
        // Remove the placed queen
        state.queens[lastMove.row] = -1;
      } else if (lastMove.type === 'remove') {
        // Re-place the removed queen
        state.queens[lastMove.row] = lastMove.col;
      }

      // Update attacked and safe cells
      const attackedArray = Array.from(
        getAttackedCells(state.queens, state.boardSize)
      );
      const safeArray = Array.from(
        getSafeCells(state.queens, state.boardSize)
      );
      
      state.attackedCells = attackedArray;
      state.safeCells = safeArray;
      state.isComplete = false;
    },

    // Set game mode
    setGameMode: (state, action) => {
      state.gameMode = action.payload;
    },

    // Timer actions
    startTimer: (state) => {
      if (!state.timerRunning) {
        state.timerRunning = true;
        state.timerStartTime = Date.now() - (state.timerElapsed * 1000);
      }
    },

    stopTimer: (state) => {
      if (state.timerRunning) {
        state.timerRunning = false;
        state.timerElapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
      }
    },

    resetTimer: (state) => {
      state.timerRunning = false;
      state.timerElapsed = 0;
      state.timerStartTime = null;
    },

    updateTimerElapsed: (state, action) => {
      if (state.timerRunning && state.timerStartTime) {
        state.timerElapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
      }
    },

    // Sound actions
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },

    setSoundVolume: (state, action) => {
      state.soundVolume = Math.max(0, Math.min(1, action.payload));
    },

    setSoundEnabled: (state, action) => {
      state.soundEnabled = action.payload;
    },

    setLastPlayedSound: (state, action) => {
      state.lastPlayedSound = action.payload;
    }
  }
});

export const {
  initializeGame,
  resetBoard,
  toggleQueen,
  setBoardSize,
  toggleSafeCells,
  toggleAttackedCells,
  useHint,
  undoMove,
  setGameMode,
  startTimer,
  stopTimer,
  resetTimer,
  updateTimerElapsed,
  toggleSound,
  setSoundVolume,
  setSoundEnabled,
  setLastPlayedSound
} = boardGameSlice.actions;

// Selectors
export const selectBoardSize = (state) => state.boardGame.boardSize;
export const selectQueens = (state) => state.boardGame.queens;
export const selectAttackedCells = (state) => state.boardGame.attackedCells;
export const selectSafeCells = (state) => state.boardGame.safeCells;
export const selectIsComplete = (state) => state.boardGame.isComplete;
export const selectShowSafeCells = (state) => state.boardGame.showSafeCells;
export const selectShowAttackedCells = (state) => state.boardGame.showAttackedCells;
export const selectHintsUsed = (state) => state.boardGame.hintsUsed;
export const selectScore = (state) => state.boardGame.score;
export const selectMoveHistory = (state) => state.boardGame.moveHistory;
export const selectGameMode = (state) => state.boardGame.gameMode;
export const selectPlacedQueensCount = (state) => countPlacedQueens(state.boardGame.queens);

// Timer selectors
export const selectTimerRunning = (state) => state.boardGame.timerRunning;
export const selectTimerElapsed = (state) => state.boardGame.timerElapsed;
export const selectTimerStartTime = (state) => state.boardGame.timerStartTime;

// Sound selectors
export const selectSoundEnabled = (state) => state.boardGame.soundEnabled;
export const selectSoundVolume = (state) => state.boardGame.soundVolume;
export const selectLastPlayedSound = (state) => state.boardGame.lastPlayedSound;

export default boardGameSlice.reducer;
