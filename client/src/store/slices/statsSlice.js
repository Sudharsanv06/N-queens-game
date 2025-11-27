import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const getUserStats = createAsyncThunk(
  'stats/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/user`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const getGlobalStats = createAsyncThunk(
  'stats/getGlobalStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/global`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch global statistics');
    }
  }
);

const initialState = {
  userStats: null,
  globalStats: null,
  loading: false,
  error: null
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStats: (state) => {
      state.userStats = null;
      state.globalStats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get User Stats
      .addCase(getUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userStats = action.payload.stats;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Global Stats
      .addCase(getGlobalStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGlobalStats.fulfilled, (state, action) => {
        state.loading = false;
        state.globalStats = action.payload.stats;
      })
      .addCase(getGlobalStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearStats } = statsSlice.actions;
export default statsSlice.reducer;
