// client/src/hooks/useKeyboardShortcuts.js
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  resetBoard,
  useHint,
  undoMove
} from '../store/slices/boardGameSlice';
import { playSound } from '../utils/sounds';

/**
 * Custom hook for handling keyboard shortcuts
 * 
 * Shortcuts:
 * - R: Reset board
 * - H: Get hint
 * - U: Undo last move
 * - Esc: Dismiss overlays (handled by components)
 */
const useKeyboardShortcuts = (options = {}) => {
  const dispatch = useDispatch();
  const {
    enabled = true,
    onReset = null,
    onHint = null,
    onUndo = null,
    enableSounds = true
  } = options;

  const handleKeyPress = useCallback((event) => {
    // Don't trigger shortcuts if user is typing in an input
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      return;
    }

    // Don't trigger if modifier keys are pressed (except Shift for capital letters)
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const key = event.key.toLowerCase();

    switch (key) {
      case 'r':
        event.preventDefault();
        dispatch(resetBoard());
        if (enableSounds) playSound('reset');
        if (onReset) onReset();
        break;

      case 'h':
        event.preventDefault();
        dispatch(useHint());
        if (enableSounds) playSound('hint');
        if (onHint) onHint();
        break;

      case 'u':
        event.preventDefault();
        dispatch(undoMove());
        if (enableSounds) playSound('undo');
        if (onUndo) onUndo();
        break;

      default:
        break;
    }
  }, [dispatch, onReset, onHint, onUndo, enableSounds]);

  useEffect(() => {
    if (!enabled) return;

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [enabled, handleKeyPress]);

  // Return object with manual trigger functions
  return {
    triggerReset: () => {
      dispatch(resetBoard());
      if (enableSounds) playSound('reset');
      if (onReset) onReset();
    },
    triggerHint: () => {
      dispatch(useHint());
      if (enableSounds) playSound('hint');
      if (onHint) onHint();
    },
    triggerUndo: () => {
      dispatch(undoMove());
      if (enableSounds) playSound('undo');
      if (onUndo) onUndo();
    }
  };
};

export default useKeyboardShortcuts;

/**
 * Usage Example:
 * 
 * ```jsx
 * import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
 * 
 * function MyComponent() {
 *   const { triggerReset, triggerHint, triggerUndo } = useKeyboardShortcuts({
 *     enabled: true,
 *     enableSounds: true,
 *     onReset: () => console.log('Board reset!'),
 *     onHint: () => console.log('Hint requested!'),
 *     onUndo: () => console.log('Undo performed!')
 *   });
 * 
 *   return (
 *     <div>
 *       <button onClick={triggerReset}>Reset (R)</button>
 *       <button onClick={triggerHint}>Hint (H)</button>
 *       <button onClick={triggerUndo}>Undo (U)</button>
 *     </div>
 *   );
 * }
 * ```
 */
