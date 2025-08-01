/**
 * Local File Storage Utilities
 * 
 * Helper functions for working with local file storage for clinic assets
 * This is a development version that doesn't rely on Supabase
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Create promises from fs functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

// Storage paths
const STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads');
const CLINIC_ASSETS_DIR = path.join(STORAGE_DIR, 'clinic-assets');

/**
 * Ensure the storage directories exist
 */
export const ensureStorageDirs = async () => {
  try {
    // Create base upload directory if it doesn't exist
    if (!(await exists(STORAGE_DIR))) {
      await mkdir(STORAGE_DIR, { recursive: true });
    }
    
    // Create clinic assets directory if it doesn't exist
    if (!(await exists(CLINIC_ASSETS_DIR))) {
      await mkdir(CLINIC_ASSETS_DIR, { recursive: true });
    }
    
    // Create logos directory if it doesn't exist
    const logosDir = path.join(CLINIC_ASSETS_DIR, 'logos');
    if (!(await exists(logosDir))) {
      await mkdir(logosDir, { recursive: true });
    }
    
    // Create favicons directory if it doesn't exist
    const faviconsDir = path.join(CLINIC_ASSETS_DIR, 'favicons');
    if (!(await exists(faviconsDir))) {
      await mkdir(faviconsDir, { recursive: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error ensuring storage directories:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload a clinic logo
 * @param {String} clinicId - The ID of the clinic
 * @param {File} file - The logo file to upload
 * @returns {Promise<Object>} - Object with upload status and file URL
 */
export const uploadClinicLogo = async (clinicId, file) => {
  try {
    await ensureStorageDirs();
    
    // Create clinic-specific directory if it doesn't exist
    const clinicDir = path.join(CLINIC_ASSETS_DIR, 'logos', clinicId);
    if (!(await exists(clinicDir))) {
      await mkdir(clinicDir, { recursive: true });
    }
    
    // Create a unique file path for the clinic logo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = path.join(clinicDir, fileName);
    const relativePath = `logos/${clinicId}/${fileName}`;
    
    // Write the file to the filesystem
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    
    // Generate the public URL for the file
    const publicUrl = `/uploads/clinic-assets/${relativePath}`;
    
    return {
      success: true,
      url: publicUrl,
      path: relativePath,
    };
  } catch (error) {
    console.error('Error uploading clinic logo:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete a clinic asset from storage
 * @param {String} filePath - The path of the file to delete
 * @returns {Promise<Object>} - Object with deletion status
 */
export const deleteClinicAsset = async (filePath) => {
  try {
    const fullPath = path.join(CLINIC_ASSETS_DIR, filePath);
    
    // Check if file exists before deleting
    if (await exists(fullPath)) {
      await unlink(fullPath);
    }
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting clinic asset:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get the default logo URL when a clinic doesn't have a custom logo
 * @returns {String} - URL of the default logo
 */
export const getDefaultLogoUrl = () => {
  return process.env.NEXT_PUBLIC_DEFAULT_LOGO_URL || '/mediboo-logo.svg';
};

/**
 * Initialize the storage directories needed for the application
 * Should be run during app setup/deployment
 */
export const initializeStorageBuckets = async () => {
  try {
    await ensureStorageDirs();
    console.log('Local storage directories initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing storage directories:', error);
    return { success: false, error: error.message };
  }
};
