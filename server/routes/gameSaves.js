import express from 'express';
import gameSaveController from '../controllers/gameSaveController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/save', optionalAuth, gameSaveController.saveGame);

router.get('/load/:saveId', optionalAuth, gameSaveController.loadGame);

router.get('/latest', optionalAuth, gameSaveController.loadLatest);

router.get('/list', authenticate, gameSaveController.listGames);

router.delete('/:saveId', authenticate, gameSaveController.deleteGame);

router.post('/hint', rateLimiter.hintLimiter, gameSaveController.requestHint);

router.post('/merge', optionalAuth, gameSaveController.mergeSave);

router.post('/session/complete', optionalAuth, gameSaveController.completeSession);

export default router;
