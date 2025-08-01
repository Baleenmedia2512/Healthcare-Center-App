/**
 * Authentication Utilities
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a password
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param {string} password - The plain text password to compare
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - Whether the password matches
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Get user info without sensitive fields
 * @param {object} user - The user object
 * @returns {object} - The sanitized user object
 */
export const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { hashedPassword, ...sanitizedUser } = user;
  return sanitizedUser;
};
