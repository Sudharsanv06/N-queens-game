import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Puzzle API Client
 * Handles all predefined puzzle-related API calls
 */

/**
 * Get list of all predefined puzzles
 */
export const getPuzzleList = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.category) params.append('category', filters.category);
    if (filters.n) params.append('n', filters.n);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/puzzles/predefined/list${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch puzzle list' };
  }
};

/**
 * Get single puzzle by ID
 */
export const getPuzzle = async (puzzleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/puzzles/predefined/${puzzleId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch puzzle' };
  }
};

/**
 * Start a puzzle attempt
 */
export const startAttempt = async (puzzleId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/puzzles/predefined/${puzzleId}/start`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to start puzzle attempt' };
  }
};

/**
 * Complete a puzzle attempt
 */
export const completeAttempt = async (puzzleId, attemptData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/puzzles/predefined/${puzzleId}/complete`,
      attemptData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to complete puzzle attempt' };
  }
};

/**
 * Get user's puzzle attempts
 */
export const getUserAttempts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.puzzleId) params.append('puzzleId', filters.puzzleId);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.skip) params.append('skip', filters.skip);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/puzzles/predefined/user/attempts${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch user attempts' };
  }
};

/**
 * Get user's puzzle progress
 */
export const getProgress = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/puzzles/predefined/user/progress`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch puzzle progress' };
  }
};

export default {
  getPuzzleList,
  getPuzzle,
  startAttempt,
  completeAttempt,
  getUserAttempts,
  getProgress
};
