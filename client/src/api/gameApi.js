import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const saveGame = async (saveData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/game/save`,
      saveData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const loadGame = async (saveId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/load/${saveId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const loadLatestGame = async (sessionId = null) => {
  try {
    const params = sessionId ? { sessionId } : {};
    const response = await axios.get(
      `${API_BASE_URL}/api/game/latest`,
      { 
        headers: getAuthHeaders(),
        params
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const listGames = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/list`,
      { 
        headers: getAuthHeaders(),
        params: { page, limit }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteGame = async (saveId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/game/${saveId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const requestHint = async (sessionId, boardState, n) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/game/hint`,
      { sessionId, boardState, n },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const mergeSave = async (mergedData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/game/merge`,
      mergedData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const completeSession = async (sessionId, analytics = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/game/session/complete`,
      { sessionId, analytics },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
