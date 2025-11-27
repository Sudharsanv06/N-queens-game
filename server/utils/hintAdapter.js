const generateHint = (boardState, n) => {
  if (!boardState || !n) {
    throw new Error('Board state and n are required');
  }

  const isValidPosition = (row, col) => {
    for (let i = 0; i < n; i++) {
      if (boardState[row][i] === 1 && i !== col) return false;
      if (boardState[i][col] === 1 && i !== row) return false;
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (boardState[i][j] === 1) {
          if (Math.abs(row - i) === Math.abs(col - j)) {
            return false;
          }
        }
      }
    }

    return true;
  };

  const getRowOccupancy = (row) => {
    return boardState[row].reduce((sum, cell) => sum + cell, 0);
  };

  const findBestHint = () => {
    const hints = [];

    for (let row = 0; row < n; row++) {
      const rowOccupancy = getRowOccupancy(row);
      
      if (rowOccupancy > 0) continue;

      for (let col = 0; col < n; col++) {
        if (boardState[row][col] === 0 && isValidPosition(row, col)) {
          let score = 0;
          
          let colOccupancy = 0;
          for (let i = 0; i < n; i++) {
            if (boardState[i][col] === 1) colOccupancy++;
          }
          if (colOccupancy === 0) score += 10;

          let diag1Threats = 0, diag2Threats = 0;
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              if (boardState[i][j] === 1) {
                if (Math.abs(row - i) === Math.abs(col - j)) {
                  if (row - i === col - j) diag1Threats++;
                  else diag2Threats++;
                }
              }
            }
          }
          score -= (diag1Threats + diag2Threats) * 5;

          if (row === 0 || row === n - 1) score += 2;
          if (col === 0 || col === n - 1) score += 2;

          hints.push({
            position: { row, col },
            score,
            reasoning: `Safe position with score ${score}. Row ${row} is empty.`
          });
        }
      }
    }

    if (hints.length === 0) {
      return null;
    }

    hints.sort((a, b) => b.score - a.score);
    return hints[0];
  };

  try {
    const hint = findBestHint();
    return hint;
  } catch (error) {
    console.error('Hint generation error:', error);
    throw new Error('Failed to generate hint');
  }
};

export default {
  generateHint
};
