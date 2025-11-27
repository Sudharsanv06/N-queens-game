import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as gameApi from '../../api/gameApi';

const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, attempts = MAX_RETRY_ATTEMPTS) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, i);
      await sleep(delay);
    }
  }
};

export const saveGameAsync = createAsyncThunk(
  'save/saveGame',
  async (saveData, { rejectWithValue }) => {
    try {
      const result = await retryWithBackoff(() => gameApi.saveGame(saveData));
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save game');
    }
  }
);

export const loadGameAsync = createAsyncThunk(
  'save/loadGame',
  async (saveId, { rejectWithValue }) => {
    try {
      const result = await gameApi.loadGame(saveId);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load game');
    }
  }
);

export const loadLatestGameAsync = createAsyncThunk(
  'save/loadLatest',
  async (sessionId, { rejectWithValue }) => {
    try {
      const result = await gameApi.loadLatestGame(sessionId);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load latest game');
    }
  }
);

export const listGamesAsync = createAsyncThunk(
  'save/listGames',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const result = await gameApi.listGames(page, limit);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to list games');
    }
  }
);

export const deleteGameAsync = createAsyncThunk(
  'save/deleteGame',
  async (saveId, { rejectWithValue }) => {
    try {
      const result = await gameApi.deleteGame(saveId);
      return { saveId, ...result };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete game');
    }
  }
);

export const requestHintAsync = createAsyncThunk(
  'save/requestHint',
  async ({ sessionId, boardState, n }, { rejectWithValue }) => {
    try {
      const result = await gameApi.requestHint(sessionId, boardState, n);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get hint');
    }
  }
);

export const mergeSaveAsync = createAsyncThunk(
  'save/mergeSave',
  async (mergedData, { rejectWithValue }) => {
    try {
      const result = await gameApi.mergeSave(mergedData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to merge save');
    }
  }
);

const initialState = {
  currentSave: null,
  savesList: [],
  pagination: null,
  lastSaveTime: null,
  saveStatus: 'idle',
  loadStatus: 'idle',
  hintStatus: 'idle',
  error: null,
  autoSaveEnabled: true,
  saveCount: 0,
  failedSaves: 0,
  pendingSave: false,
  conflictData: null,
  lastHint: null,
  hintsRemaining: 3,
  hintsUsed: 0
};

const saveSlice = createSlice({
  name: 'save',
  initialState,
  reducers: {
    setSaveStatus: (state, action) => {
      state.saveStatus = action.payload;
    },
    setAutoSaveEnabled: (state, action) => {
      state.autoSaveEnabled = action.payload;
    },
    incrementFailedSaves: (state) => {
      state.failedSaves += 1;
    },
    resetFailedSaves: (state) => {
      state.failedSaves = 0;
    },
    setConflictData: (state, action) => {
      state.conflictData = action.payload;
    },
    clearConflictData: (state) => {
      state.conflictData = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLocalSave: (state, action) => {
      state.currentSave = action.payload;
      state.lastSaveTime = new Date().toISOString();
    },
    clearSaveState: (state) => {
      state.currentSave = null;
      state.lastSaveTime = null;
      state.saveStatus = 'idle';
      state.error = null;
      state.conflictData = null;
      state.lastHint = null;
      state.hintsUsed = 0;
      state.hintsRemaining = 3;
    },
    setHintsUsed: (state, action) => {
      state.hintsUsed = action.payload;
      state.hintsRemaining = Math.max(0, 3 - action.payload);
    },
    clearHint: (state) => {
      state.lastHint = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveGameAsync.pending, (state) => {
        state.saveStatus = 'loading';
        state.pendingSave = true;
        state.error = null;
      })
      .addCase(saveGameAsync.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.pendingSave = false;
        state.currentSave = action.payload.data;
        state.lastSaveTime = new Date().toISOString();
        state.saveCount += 1;
        state.failedSaves = 0;
        state.error = null;
      })
      .addCase(saveGameAsync.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.pendingSave = false;
        state.error = action.payload;
        state.failedSaves += 1;
      })
      .addCase(loadGameAsync.pending, (state) => {
        state.loadStatus = 'loading';
        state.error = null;
      })
      .addCase(loadGameAsync.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.currentSave = action.payload.data;
        state.error = null;
      })
      .addCase(loadGameAsync.rejected, (state, action) => {
        state.loadStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(loadLatestGameAsync.pending, (state) => {
        state.loadStatus = 'loading';
        state.error = null;
      })
      .addCase(loadLatestGameAsync.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.currentSave = action.payload.data;
        state.hintsUsed = action.payload.data?.hintsUsed || 0;
        state.hintsRemaining = Math.max(0, 3 - state.hintsUsed);
        state.error = null;
      })
      .addCase(loadLatestGameAsync.rejected, (state, action) => {
        state.loadStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(listGamesAsync.pending, (state) => {
        state.loadStatus = 'loading';
        state.error = null;
      })
      .addCase(listGamesAsync.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.savesList = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(listGamesAsync.rejected, (state, action) => {
        state.loadStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteGameAsync.fulfilled, (state, action) => {
        state.savesList = state.savesList.filter(
          save => save.id !== action.payload.saveId
        );
        if (state.currentSave?.id === action.payload.saveId) {
          state.currentSave = null;
        }
      })
      .addCase(requestHintAsync.pending, (state) => {
        state.hintStatus = 'loading';
        state.error = null;
      })
      .addCase(requestHintAsync.fulfilled, (state, action) => {
        state.hintStatus = 'succeeded';
        state.lastHint = action.payload.hint;
        state.hintsUsed = action.payload.hintsUsed;
        state.hintsRemaining = action.payload.hintsRemaining;
        state.error = null;
      })
      .addCase(requestHintAsync.rejected, (state, action) => {
        state.hintStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(mergeSaveAsync.fulfilled, (state, action) => {
        state.currentSave = action.payload.data;
        state.conflictData = null;
        state.saveStatus = 'succeeded';
      });
  }
});

export const {
  setSaveStatus,
  setAutoSaveEnabled,
  incrementFailedSaves,
  resetFailedSaves,
  setConflictData,
  clearConflictData,
  clearError,
  updateLocalSave,
  clearSaveState,
  setHintsUsed,
  clearHint
} = saveSlice.actions;

export default saveSlice.reducer;
