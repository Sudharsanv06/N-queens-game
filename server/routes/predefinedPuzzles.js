import express from 'express';
import { authRequired, optionalAuth } from '../middleware/auth.js';
import {
  getPuzzleList,
  getPuzzleById,
  startPuzzleAttempt,
  completePuzzleAttempt,
  getUserAttempts,
  getUserProgress
} from '../controllers/predefinedPuzzleController.js';

const router = express.Router();

/**
 * GET /api/puzzles/predefined/list
 * Get list of all predefined puzzles
 * Optional auth - shows user progress if authenticated
 */
router.get('/predefined/list', optionalAuth, getPuzzleList);

/**
 * GET /api/puzzles/predefined/:id
 * Get single puzzle by puzzleId
 * Optional auth - shows user progress if authenticated
 */
router.get('/predefined/:id', optionalAuth, getPuzzleById);

/**
 * POST /api/puzzles/predefined/:id/start
 * Start a puzzle attempt
 * Requires authentication
 */
router.post('/predefined/:id/start', authRequired, startPuzzleAttempt);

/**
 * POST /api/puzzles/predefined/:id/complete
 * Complete a puzzle attempt
 * Requires authentication
 */
router.post('/predefined/:id/complete', authRequired, completePuzzleAttempt);

/**
 * GET /api/puzzles/predefined/user/attempts
 * Get user's puzzle attempts
 * Requires authentication
 */
router.get('/predefined/user/attempts', authRequired, getUserAttempts);

/**
 * GET /api/puzzles/predefined/user/progress
 * Get user's overall puzzle progress
 * Requires authentication
 */
router.get('/predefined/user/progress', authRequired, getUserProgress);

export default router;
