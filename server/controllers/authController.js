import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * Sign up a new user
 */
export const signup = async (req, res) => {
  try {
    const { username, name, email, password, mobile } = req.body;
    
    // Validation
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ 
        success: false,
        message: 'Username must be at least 3 characters long' 
      });
    }
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Name must be at least 2 characters long' 
      });
    }
    
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid email address' 
      });
    }
    
    // Check if user exists
    // Escape special regex characters in username
    const escapedUsername = username.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is already registered' 
        });
      }
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return res.status(400).json({ 
          success: false,
          message: 'Username is already taken' 
        });
      }
    }
    
    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      username: username.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      mobile: mobile || undefined,
      lastLogin: new Date()
    });
    
    await user.save();
    
    console.log('✅ User created successfully:', user.email);
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: accessToken,
      refreshToken,
      user: user.toSafeObject()
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({ 
        success: false,
        message: `${field === 'email' ? 'Email' : 'Username'} is already taken` 
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        message: errors.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create account. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Log in an existing user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }
    
    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is required' 
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated. Please contact support.' 
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    console.log('✅ User logged in successfully:', user.email);
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    
    // Limit refresh tokens to last 5
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: user.toSafeObject()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        message: 'Refresh token is required' 
      });
    }
    
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid refresh token' 
      });
    }
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid refresh token' 
      });
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    res.status(200).json({
      success: true,
      token: newAccessToken
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid or expired refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.id;
    
    if (refreshToken) {
      // Remove specific refresh token
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } }
      });
    } else {
      // Remove all refresh tokens (logout from all devices)
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Logout failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      user: user.toSafeObject()
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const userId = req.user.id;

    console.log('Update profile request:', { name, email, avatar: avatar ? avatar.substring(0, 50) + '...' : 'none' });

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validation
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Only check if email is taken if the user is changing their email
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== currentUser.email.toLowerCase()) {
        const existingUser = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: userId }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use'
          });
        }
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    console.log('Update data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User updated successfully. New avatar:', updatedUser.avatar);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toSafeObject()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Upload avatar
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar file if it exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    console.log('✅ Avatar uploaded successfully for user:', user.email);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        totalScore: user.totalScore,
        currentStreak: user.currentStreak,
        bestTime: user.bestTime
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  signup,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  uploadAvatar,
  upload
};
