import express from 'express';
import { getUserStats, getGlobalStats } from '../controllers/statsController.js';
import { authRequired, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// User stats (requires authentication)
router.get('/user', authRequired, getUserStats);

// Global stats (public)
router.get('/global', optionalAuth, getGlobalStats);

export default router;
