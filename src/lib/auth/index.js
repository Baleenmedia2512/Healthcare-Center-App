/**
 * Auth Library Index
 * 
 * Export all auth-related utilities from a single file
 */

import { useAuth, AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { hashPassword, comparePassword, sanitizeUser } from './utils';

export {
  useAuth,
  AuthProvider,
  ProtectedRoute,
  hashPassword,
  comparePassword,
  sanitizeUser
};
