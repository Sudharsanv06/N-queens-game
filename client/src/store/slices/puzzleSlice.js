import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as puzzleApi from '../../api/puzzleApi';

/**
 * Async Thunks
 */

// Fetch list of puzzles
export const fetchPuzzleList = createAsyncThunk(
  'puzzle/fetchList',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await puzzleApi.getPuzzleList(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch puzzles');
    }
  }
);

// Fetch single puzzle
export const fetchPuzzle = createAsyncThunk(
  'puzzle/fetchSingle',
  async (puzzleId, { rejectWithValue }) => {
    try {
      const response = await puzzleApi.getPuzzle(puzzleId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch puzzle');
    }
  }
);

// Start puzzle attempt
export const startPuzzleAttempt = createAsyncThunk(
  'puzzle/startAttempt',
  async (puzzleId, { rejectWithValue }) => {
    try {
      const response = await puzzleApi.startAttempt(puzzleId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to start puzzle');
    }
  }
);

// Complete puzzle attempt
export const completePuzzleAttempt = createAsyncThunk(
  'puzzle/completeAttempt',
  async ({ puzzleId, attemptData }, { rejectWithValue }) => {
    try {
      const response = await puzzleApi.completeAttempt(puzzleId, attemptData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to complete puzzle');
    }
  }
);

// Fetch user puzzle progress
export const fetchUserPuzzleProgress = createAsyncThunk(
  'puzzle/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await puzzleApi.getProgress();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch progress');
    }
  }
);

// Fetch user attempts
export const fetchUserAttempts = createAsyncThunk(
  'puzzle/fetchAttempts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await puzzleApi.getUserAttempts(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attempts');
    }
  }
);

/**
 * Puzzle Slice
 */
const puzzleSlice = createSlice({
  name: 'puzzle',
  initialState: {
    // Puzzle list
    puzzles: [],
    totalPuzzles: 0,
    filteredPuzzles: [],
    
    // Current puzzle
    currentPuzzle: null,
    
    // Current attempt
    currentAttempt: null,
    
    // User progress
    userProgress: null,
    
    // User attempts history
    attempts: [],
    totalAttempts: 0,
    
    // Filters
    filters: {
      difficulty: null,
      category: null,
      n: null
    },
    
    // Loading states
    loading: false,
    listLoading: false,
    progressLoading: false,
    attemptLoading: false,
    
    // Error states
    error: null,
    listError: null,
    progressError: null,
    attemptError: null,
    
    // Success flags
    attemptStarted: false,
    attemptCompleted: false
  },
  reducers: {
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        difficulty: null,
        category: null,
        n: null
      };
    },
    
    // Clear current puzzle
    clearCurrentPuzzle: (state) => {
      state.currentPuzzle = null;
      state.currentAttempt = null;
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.listError = null;
      state.progressError = null;
      state.attemptError = null;
    },
    
    // Reset attempt flags
    resetAttemptFlags: (state) => {
      state.attemptStarted = false;
      state.attemptCompleted = false;
    },
    
    // Update current attempt (for real-time updates during gameplay)
    updateCurrentAttempt: (state, action) => {
      if (state.currentAttempt) {
        state.currentAttempt = { ...state.currentAttempt, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch Puzzle List
    builder
      .addCase(fetchPuzzleList.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchPuzzleList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.puzzles = action.payload.puzzles || [];
        state.totalPuzzles = action.payload.total || 0;
        state.filteredPuzzles = action.payload.puzzles || [];
      })
      .addCase(fetchPuzzleList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      });
    
    // Fetch Single Puzzle
    builder
      .addCase(fetchPuzzle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPuzzle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPuzzle = action.payload.puzzle;
      })
      .addCase(fetchPuzzle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Start Puzzle Attempt
    builder
      .addCase(startPuzzleAttempt.pending, (state) => {
        state.attemptLoading = true;
        state.attemptError = null;
        state.attemptStarted = false;
      })
      .addCase(startPuzzleAttempt.fulfilled, (state, action) => {
        state.attemptLoading = false;
        state.currentAttempt = action.payload.attempt;
        state.currentPuzzle = action.payload.puzzle;
        state.attemptStarted = true;
      })
      .addCase(startPuzzleAttempt.rejected, (state, action) => {
        state.attemptLoading = false;
        state.attemptError = action.payload;
        state.attemptStarted = false;
      });
    
    // Complete Puzzle Attempt
    builder
      .addCase(completePuzzleAttempt.pending, (state) => {
        state.attemptLoading = true;
        state.attemptError = null;
        state.attemptCompleted = false;
      })
      .addCase(completePuzzleAttempt.fulfilled, (state, action) => {
        state.attemptLoading = false;
        state.currentAttempt = action.payload.attempt;
        state.attemptCompleted = true;
      })
      .addCase(completePuzzleAttempt.rejected, (state, action) => {
        state.attemptLoading = false;
        state.attemptError = action.payload;
        state.attemptCompleted = false;
      });
    
    // Fetch User Progress
    builder
      .addCase(fetchUserPuzzleProgress.pending, (state) => {
        state.progressLoading = true;
        state.progressError = null;
      })
      .addCase(fetchUserPuzzleProgress.fulfilled, (state, action) => {
        state.progressLoading = false;
        state.userProgress = action.payload.progress;
      })
      .addCase(fetchUserPuzzleProgress.rejected, (state, action) => {
        state.progressLoading = false;
        state.progressError = action.payload;
      });
    
    // Fetch User Attempts
    builder
      .addCase(fetchUserAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.attempts = action.payload.attempts || [];
        state.totalAttempts = action.payload.total || 0;
      })
      .addCase(fetchUserAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setFilters,
  clearFilters,
  clearCurrentPuzzle,
  clearErrors,
  resetAttemptFlags,
  updateCurrentAttempt
} = puzzleSlice.actions;

export default puzzleSlice.reducer;
