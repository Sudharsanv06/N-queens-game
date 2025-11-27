import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const getFastestSolvers = createAsyncThunk(
  'leaderboard/getFastestSolvers',
  async ({ boardSize, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (boardSize) params.append('boardSize', boardSize.toString());
      
      const response = await axios.get(`${API_BASE_URL}/leaderboard/fastest?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const getHighestBoardSizes = createAsyncThunk(
  'leaderboard/getHighestBoardSizes',
  async ({ limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard/highest-board?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const getMostGamesPlayed = createAsyncThunk(
  'leaderboard/getMostGamesPlayed',
  async ({ limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard/most-games?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

const initialState = {
  fastestSolvers: [],
  highestBoardSizes: [],
  mostGamesPlayed: [],
  currentUserRank: null,
  loading: false,
  error: null,
  activeCategory: 'fastest' // 'fastest' | 'highest-board' | 'most-games'
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Fastest Solvers
      .addCase(getFastestSolvers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFastestSolvers.fulfilled, (state, action) => {
        state.loading = false;
        state.fastestSolvers = action.payload.leaderboard;
        state.currentUserRank = action.payload.currentUserRank;
      })
      .addCase(getFastestSolvers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Highest Board Sizes
      .addCase(getHighestBoardSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHighestBoardSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.highestBoardSizes = action.payload.leaderboard;
        state.currentUserRank = action.payload.currentUserRank;
      })
      .addCase(getHighestBoardSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Most Games Played
      .addCase(getMostGamesPlayed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMostGamesPlayed.fulfilled, (state, action) => {
        state.loading = false;
        state.mostGamesPlayed = action.payload.leaderboard;
        state.currentUserRank = action.payload.currentUserRank;
      })
      .addCase(getMostGamesPlayed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setActiveCategory } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
