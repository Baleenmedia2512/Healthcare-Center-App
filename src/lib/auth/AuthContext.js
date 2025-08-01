/**
 * Authentication Context Provider
 * 
 * Provides authentication state and functions throughout the application
 */

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';
import { AUTH_CONFIG } from '../../config';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const user = session?.user || null;
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';

  // Get the dashboard route based on user role
  const getDashboardByRole = (role) => {
    return AUTH_CONFIG.routes[role?.toLowerCase()] || AUTH_CONFIG.routes.default;
  };

  // Login function
  const login = async (email, password) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return { success: false, error: result.error };
      }

      // Refresh the session
      const userRole = session?.user?.role;
      const redirectPath = getDashboardByRole(userRole);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push(redirectPath);
      return { success: true };
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An error occurred during login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return { success: true };
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: error.message || 'An error occurred during logout',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    // Handle array of roles or single role
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };
  
  // Check if user has access to a specific clinic
  const hasClinicAccess = (clinicId) => {
    if (!user) return false;
    
    // SUPERADMIN has access to all clinics
    if (user.role === 'superadmin') return true;
    
    // CLINICADMIN, BRANCHADMIN, DOCTOR have access to their assigned clinic
    return user.clinicId === clinicId;
  };
  
  // Check if user has access to a specific branch
  const hasBranchAccess = (branchId) => {
    if (!user) return false;
    
    // SUPERADMIN has access to all branches
    if (user.role === 'superadmin') return true;
    
    // CLINICADMIN has access to all branches in their clinic
    // This would require an additional check against the branch's clinicId
    if (user.role === 'clinicadmin') {
      // For immediate check we can return true if we know the branch belongs to the user's clinic
      // In practice, you might want to verify this with an API call or pass in the branch's clinicId
      return true; // This is simplified - should check if branch belongs to user's clinic
    }
    
    // BRANCHADMIN, DOCTOR have access only to their assigned branch
    return user.branchId === branchId;
  };

  // Auth context value
  const authContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    hasClinicAccess,
    hasBranchAccess,
    getDashboardByRole,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
