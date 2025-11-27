// client/src/utils/boardHelpers.js
/**
 * Frontend wrapper for N-Queens game logic
 * Mirrors server/utils/helpers.js functionality
 */

/**
 * Check if placing a queen at (row, col) is valid
 * @param {number[]} queens - Array where index is row, value is column
 * @param {number} row - Row to place queen
 * @param {number} col - Column to place queen
 * @returns {boolean} - True if placement is safe
 */
export const isSafePlacement = (queens, row, col) => {
  // Check if column is already occupied
  if (queens.includes(col)) return false;

  // Check all previously placed queens
  for (let i = 0; i < queens.length; i++) {
    if (queens[i] === -1) continue; // Skip empty rows
    
    const existingCol = queens[i];
    
    // Check column conflict
    if (existingCol === col) return false;
    
    // Check diagonal conflicts
    const rowDiff = Math.abs(row - i);
    const colDiff = Math.abs(col - existingCol);
    
    if (rowDiff === colDiff) return false;
  }
  
  return true;
};

/**
 * Get all cells under attack by placed queens
 * @param {number[]} queens - Array where index is row, value is column
 * @param {number} boardSize - Size of the board
 * @returns {Set<string>} - Set of "row,col" strings representing attacked cells
 */
export const getAttackedCells = (queens, boardSize) => {
  const attacked = new Set();
  
  queens.forEach((col, row) => {
    if (col === -1) return; // Skip empty rows
    
    // Mark the queen's position
    attacked.add(`${row},${col}`);
    
    // Mark entire row
    for (let c = 0; c < boardSize; c++) {
      attacked.add(`${row},${c}`);
    }
    
    // Mark entire column
    for (let r = 0; r < boardSize; r++) {
      attacked.add(`${r},${col}`);
    }
    
    // Mark diagonals (top-left to bottom-right)
    for (let i = -boardSize; i < boardSize; i++) {
      const r1 = row + i;
      const c1 = col + i;
      if (r1 >= 0 && r1 < boardSize && c1 >= 0 && c1 < boardSize) {
        attacked.add(`${r1},${c1}`);
      }
    }
    
    // Mark diagonals (top-right to bottom-left)
    for (let i = -boardSize; i < boardSize; i++) {
      const r2 = row + i;
      const c2 = col - i;
      if (r2 >= 0 && r2 < boardSize && c2 >= 0 && c2 < boardSize) {
        attacked.add(`${r2},${c2}`);
      }
    }
  });
  
  return attacked;
};

/**
 * Get queen positions as array of {row, col} objects
 * @param {number[]} queens - Array where index is row, value is column
 * @returns {Array<{row: number, col: number}>} - Array of queen positions
 */
export const getQueenPositions = (queens) => {
  return queens
    .map((col, row) => (col !== -1 ? { row, col } : null))
    .filter(Boolean);
};

/**
 * Check if the current board state is a valid solution
 * @param {number[]} queens - Array where index is row, value is column
 * @param {number} boardSize - Size of the board
 * @returns {boolean} - True if it's a valid N-Queens solution
 */
export const isValidSolution = (queens, boardSize) => {
  // Must have exactly N queens placed
  const placedQueens = queens.filter(col => col !== -1).length;
  if (placedQueens !== boardSize) return false;
  
  // Check each queen placement is safe
  for (let row = 0; row < boardSize; row++) {
    const col = queens[row];
    if (col === -1) return false;
    
    // Check against all other queens
    for (let otherRow = 0; otherRow < boardSize; otherRow++) {
      if (row === otherRow) continue;
      
      const otherCol = queens[otherRow];
      if (otherCol === -1) continue;
      
      // Check column conflict
      if (col === otherCol) return false;
      
      // Check diagonal conflict
      if (Math.abs(row - otherRow) === Math.abs(col - otherCol)) return false;
    }
  }
  
  return true;
};

/**
 * Calculate score based on board completion and time
 * @param {number} boardSize - Size of the board
 * @param {number} timeElapsed - Time in seconds
 * @param {number} hintsUsed - Number of hints used
 * @returns {number} - Calculated score
 */
export const calculateScore = (boardSize, timeElapsed, hintsUsed = 0) => {
  const basePoints = boardSize * 100;
  const timeBonus = Math.max(0, 1000 - timeElapsed);
  const hintPenalty = hintsUsed * 50;
  
  return Math.max(0, Math.floor(basePoints + timeBonus - hintPenalty));
};

/**
 * Get safe cells where a queen can be placed
 * @param {number[]} queens - Array where index is row, value is column
 * @param {number} boardSize - Size of the board
 * @returns {Set<string>} - Set of "row,col" strings representing safe cells
 */
export const getSafeCells = (queens, boardSize) => {
  const attacked = getAttackedCells(queens, boardSize);
  const safe = new Set();
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const key = `${row},${col}`;
      if (!attacked.has(key)) {
        safe.add(key);
      }
    }
  }
  
  return safe;
};

/**
 * Generate a hint for the next safe move
 * @param {number[]} queens - Array where index is row, value is column
 * @param {number} boardSize - Size of the board
 * @returns {{row: number, col: number} | null} - Next safe position or null
 */
export const getHint = (queens, boardSize) => {
  // Find first empty row
  const emptyRow = queens.findIndex(col => col === -1);
  if (emptyRow === -1) return null;
  
  // Find first safe column in that row
  for (let col = 0; col < boardSize; col++) {
    if (isSafePlacement(queens, emptyRow, col)) {
      return { row: emptyRow, col };
    }
  }
  
  return null;
};

/**
 * Initialize empty board
 * @param {number} size - Board size
 * @returns {number[]} - Array of -1s representing empty board
 */
export const initializeBoard = (size) => {
  return Array(size).fill(-1);
};

/**
 * Count number of queens placed
 * @param {number[]} queens - Array where index is row, value is column
 * @returns {number} - Number of placed queens
 */
export const countPlacedQueens = (queens) => {
  return queens.filter(col => col !== -1).length;
};
