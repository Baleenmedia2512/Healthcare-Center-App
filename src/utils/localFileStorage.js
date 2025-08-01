/**
 * Browser-Compatible Storage Utilities
 * 
 * Helper functions for working with clinic assets storage
 * This version works in the browser without Node.js dependencies
 */

// No Node.js imports - these will be used only in API routes

/**
 * Get the default logo URL when a clinic doesn't have a custom logo
 * @returns {String} - URL of the default logo
 */
export const getDefaultLogoUrl = () => {
  return process.env.NEXT_PUBLIC_DEFAULT_LOGO_URL || '/mediboo-logo.svg';
};
