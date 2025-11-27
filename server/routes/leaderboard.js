import express from 'express';
import { getFastestSolvers, getHighestBoardSizes, getMostGamesPlayed } from '../controllers/leaderboardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// All leaderboard routes support optional authentication
router.use(optionalAuth);

// Get fastest solvers leaderboard
router.get('/fastest', getFastestSolvers);

// Get highest board sizes leaderboard
router.get('/highest-board', getHighestBoardSizes);

// Get most games played leaderboard
router.get('/most-games', getMostGamesPlayed);

export default router;
