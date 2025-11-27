import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveGameAsync } from '../store/slices/saveSlice';
import { v4 as uuidv4 } from 'uuid';

const AUTO_SAVE_INTERVAL = 10000;
const LOCAL_STORAGE_PREFIX = 'nqueens:autosave:';

export const useAutoSave = (gameState, sessionId, options = {}) => {
  const {
    interval = AUTO_SAVE_INTERVAL,
    enabled = true,
    onSaveSuccess,
    onSaveError
  } = options;

  const dispatch = useDispatch();
  const { autoSaveEnabled, saveStatus } = useSelector(state => state.save);
  const { user } = useSelector(state => state.auth || { user: null });
  
  const intervalRef = useRef(null);
  const lastSaveRef = useRef(null);
  const saveQueueRef = useRef([]);

  const getStorageKey = useCallback(() => {
    if (user?.id) {
      return `${LOCAL_STORAGE_PREFIX}${user.id}:${sessionId}`;
    }
    return `${LOCAL_STORAGE_PREFIX}guest:${sessionId}`;
  }, [user, sessionId]);

  const saveToLocalStorage = useCallback((data) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }, [getStorageKey]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, [getStorageKey]);

  const performSave = useCallback(async (data) => {
    if (!data || !sessionId) return;

    const savePayload = {
      sessionId,
      n: data.n,
      boardState: data.boardState || data.board,
      moves: data.moves || [],
      placedQueens: data.placedQueens || 0,
      timer: data.timer || 0,
      hintsUsed: data.hintsUsed || 0,
      lastUpdated: new Date().toISOString(),
      metadata: {
        device: 'web',
        appVersion: '1.0.0',
        platform: navigator.platform || 'unknown'
      }
    };

    saveToLocalStorage(savePayload);

    try {
      const result = await dispatch(saveGameAsync(savePayload)).unwrap();
      lastSaveRef.current = Date.now();
      
      if (onSaveSuccess) {
        onSaveSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.error('Auto-save failed:', error);
      saveQueueRef.current.push(savePayload);
      
      if (onSaveError) {
        onSaveError(error);
      }
      
      throw error;
    }
  }, [dispatch, sessionId, saveToLocalStorage, onSaveSuccess, onSaveError]);

  const retryFailedSaves = useCallback(async () => {
    if (saveQueueRef.current.length === 0) return;

    const queue = [...saveQueueRef.current];
    saveQueueRef.current = [];

    for (const payload of queue) {
      try {
        await dispatch(saveGameAsync(payload)).unwrap();
      } catch (error) {
        console.error('Retry save failed:', error);
        saveQueueRef.current.push(payload);
      }
    }
  }, [dispatch]);

  const forceSave = useCallback(async () => {
    if (!gameState || !sessionId) return null;
    return await performSave(gameState);
  }, [gameState, sessionId, performSave]);

  useEffect(() => {
    if (!enabled || !autoSaveEnabled || !gameState || !sessionId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (saveStatus !== 'loading') {
        performSave(gameState);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, autoSaveEnabled, gameState, sessionId, interval, performSave, saveStatus]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameState && sessionId) {
        const savePayload = {
          sessionId,
          n: gameState.n,
          boardState: gameState.boardState || gameState.board,
          moves: gameState.moves || [],
          placedQueens: gameState.placedQueens || 0,
          timer: gameState.timer || 0,
          hintsUsed: gameState.hintsUsed || 0,
          lastUpdated: new Date().toISOString(),
          metadata: {
            device: 'web',
            appVersion: '1.0.0',
            platform: navigator.platform || 'unknown'
          }
        };
        saveToLocalStorage(savePayload);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, sessionId, saveToLocalStorage]);

  return {
    forceSave,
    loadFromLocalStorage,
    saveToLocalStorage,
    retryFailedSaves,
    isSaving: saveStatus === 'loading',
    lastSaveTime: lastSaveRef.current,
    pendingSaves: saveQueueRef.current.length
  };
};

export default useAutoSave;
