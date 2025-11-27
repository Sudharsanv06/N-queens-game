import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadLatestGameAsync, setConflictData } from '../store/slices/saveSlice';

const LOCAL_STORAGE_PREFIX = 'nqueens:autosave:';

export const useResumeOnLogin = (sessionId, options = {}) => {
  const {
    autoResumeEnabled = true,
    onResumeSuccess,
    onResumeError,
    onConflictDetected
  } = options;

  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth || { user: null, isAuthenticated: false });
  const [hasChecked, setHasChecked] = useState(false);
  const [resumeStatus, setResumeStatus] = useState('idle');

  const getStorageKey = useCallback(() => {
    if (user?.id) {
      return `${LOCAL_STORAGE_PREFIX}${user.id}:${sessionId}`;
    }
    return `${LOCAL_STORAGE_PREFIX}guest:${sessionId}`;
  }, [user, sessionId]);

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

  const detectConflict = useCallback((localSave, serverSave) => {
    if (!localSave || !serverSave) return null;

    const localTime = new Date(localSave.lastUpdated).getTime();
    const serverTime = new Date(serverSave.lastUpdated).getTime();

    const timeDiff = Math.abs(localTime - serverTime);
    if (timeDiff < 5000) {
      return null;
    }

    const movesDiffer = JSON.stringify(localSave.moves) !== JSON.stringify(serverSave.moves);
    const boardDiffer = JSON.stringify(localSave.boardState) !== JSON.stringify(serverSave.boardState);

    if (movesDiffer || boardDiffer) {
      return {
        local: localSave,
        server: serverSave,
        localTime,
        serverTime,
        newerSource: localTime > serverTime ? 'local' : 'server'
      };
    }

    return null;
  }, []);

  const mergeGameStates = useCallback((local, server) => {
    const movesMap = new Map();

    [...(local.moves || []), ...(server.moves || [])].forEach(move => {
      const key = `${move.row}-${move.col}`;
      const existing = movesMap.get(key);
      
      if (!existing || new Date(move.timestamp) > new Date(existing.timestamp)) {
        movesMap.set(key, move);
      }
    });

    const mergedMoves = Array.from(movesMap.values()).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const n = local.n || server.n;
    const mergedBoard = Array(n).fill(null).map(() => Array(n).fill(0));

    mergedMoves.forEach(move => {
      if (move.action === 'place') {
        mergedBoard[move.row][move.col] = 1;
      } else if (move.action === 'remove') {
        mergedBoard[move.row][move.col] = 0;
      }
    });

    let placedQueens = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (mergedBoard[i][j] === 1) placedQueens++;
      }
    }

    return {
      sessionId: local.sessionId || server.sessionId,
      n,
      boardState: mergedBoard,
      moves: mergedMoves,
      placedQueens,
      timer: Math.max(local.timer || 0, server.timer || 0),
      hintsUsed: Math.max(local.hintsUsed || 0, server.hintsUsed || 0),
      lastUpdated: new Date().toISOString(),
      metadata: server.metadata || local.metadata
    };
  }, []);

  const attemptResume = useCallback(async () => {
    if (!autoResumeEnabled || !sessionId || hasChecked) {
      return null;
    }

    setResumeStatus('loading');

    try {
      const localSave = loadFromLocalStorage();
      
      let serverSave = null;
      if (isAuthenticated) {
        try {
          const result = await dispatch(loadLatestGameAsync(sessionId)).unwrap();
          serverSave = result;
        } catch (error) {
          if (error !== 'Failed to load latest game' && error.message !== 'No saved game found') {
            console.error('Failed to load server save:', error);
          }
        }
      }

      const conflict = detectConflict(localSave, serverSave);

      if (conflict) {
        dispatch(setConflictData(conflict));
        setResumeStatus('conflict');
        
        if (onConflictDetected) {
          onConflictDetected(conflict);
        }
        
        setHasChecked(true);
        return { conflict, localSave, serverSave };
      }

      const saveToUse = serverSave || localSave;
      
      if (saveToUse) {
        setResumeStatus('succeeded');
        
        if (onResumeSuccess) {
          onResumeSuccess(saveToUse);
        }
        
        setHasChecked(true);
        return saveToUse;
      }

      setResumeStatus('no-save');
      setHasChecked(true);
      return null;
    } catch (error) {
      console.error('Resume failed:', error);
      setResumeStatus('failed');
      
      if (onResumeError) {
        onResumeError(error);
      }
      
      setHasChecked(true);
      return null;
    }
  }, [
    autoResumeEnabled,
    sessionId,
    hasChecked,
    isAuthenticated,
    loadFromLocalStorage,
    dispatch,
    detectConflict,
    onResumeSuccess,
    onResumeError,
    onConflictDetected
  ]);

  useEffect(() => {
    if (autoResumeEnabled && sessionId && !hasChecked) {
      attemptResume();
    }
  }, [autoResumeEnabled, sessionId, hasChecked, attemptResume]);

  const reset = useCallback(() => {
    setHasChecked(false);
    setResumeStatus('idle');
  }, []);

  return {
    attemptResume,
    mergeGameStates,
    resumeStatus,
    hasChecked,
    reset,
    isResuming: resumeStatus === 'loading'
  };
};

export default useResumeOnLogin;
