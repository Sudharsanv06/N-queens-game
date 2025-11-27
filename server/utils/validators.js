// server/utils/validators.js
/**
 * Validation utilities for request data
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8
}

export const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export const validateBoardSize = (size) => {
  return Number.isInteger(size) && size >= 4 && size <= 20
}

export const validateGameMode = (mode) => {
  const validModes = ['classic', 'time-trial', 'puzzle', 'multiplayer', 'daily-challenge']
  return validModes.includes(mode)
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000) // Limit length
}

export const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
