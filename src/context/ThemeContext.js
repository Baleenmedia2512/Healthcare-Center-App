import React, { createContext, useContext, useState, useEffect } from 'react';
import { extendTheme } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import baseTheme from '@/theme/theme';

const ThemeContext = createContext();

/**
 * Custom hook to access the theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme Provider Component
 * Provides dynamic theming based on the current clinic settings
 */
export const ThemeProvider = ({ children }) => {
  const { data: session } = useSession();
  const [clinicTheme, setClinicTheme] = useState(baseTheme);
  const [clinicBranding, setClinicBranding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClinicTheme = async () => {
      // Only proceed if there's an active session with a clinic ID
      if (session?.user?.clinicId) {
        setIsLoading(true);
        try {
          // Fetch clinic branding settings
          const response = await apiClient.get(`/api/clinics/${session.user.clinicId}/branding`);
          const branding = response.data;
          
          setClinicBranding(branding);
          
          // Create custom theme based on clinic settings
          const customTheme = extendTheme({
            ...baseTheme,
            colors: {
              ...baseTheme.colors,
              brand: {
                ...baseTheme.colors.brand,
                100: branding.primaryColor || baseTheme.colors.brand[100],
                200: branding.secondaryColor || baseTheme.colors.brand[200],
              }
            },
          });
          
          setClinicTheme(customTheme);
        } catch (error) {
          console.error("Failed to load clinic theme:", error);
          // Fallback to base theme
          setClinicTheme(baseTheme);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No clinic in session, use base theme
        setClinicTheme(baseTheme);
        setIsLoading(false);
      }
    };
    
    loadClinicTheme();
  }, [session]);
  
  // Only use standard context provider pattern for consistent theme access
  return (
    <ThemeContext.Provider value={{ 
      theme: clinicTheme, 
      baseTheme, 
      clinicBranding,
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Get CSS variables for custom clinic styling
 * @param {Object} branding - The clinic branding settings
 * @returns {String} CSS variables as a string
 */
export const getClinicCssVariables = (branding) => {
  if (!branding) return '';
  
  return `
    :root {
      --clinic-primary-color: ${branding.primaryColor || '#84c9ef'};
      --clinic-secondary-color: ${branding.secondaryColor || '#b4d2ed'};
      ${branding.customCss || ''}
    }
  `;
};

export default ThemeContext;
