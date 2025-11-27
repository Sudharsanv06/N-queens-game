import express from 'express';
import { getProfile, updateProfile, deleteAccount, changePassword } from '../controllers/userController.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authRequired);

// Get user profile
router.get('/profile/:userId?', getProfile);

// Update user profile
router.put('/profile', updateProfile);

// Change password
router.put('/password', changePassword);

// Delete account
router.delete('/account', deleteAccount);

export default router;
