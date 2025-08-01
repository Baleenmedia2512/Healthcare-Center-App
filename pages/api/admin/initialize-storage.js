import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Create promises from fs functions
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

// Storage paths
const STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads');
const CLINIC_ASSETS_DIR = path.join(STORAGE_DIR, 'clinic-assets');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

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
    
    return res.status(200).json({ 
      success: true,
      message: 'Storage directories created successfully'
    });
  } catch (error) {
    console.error('Error initializing storage directories:', error);
    return res.status(500).json({ 
      error: 'Failed to initialize storage directories',
      message: error.message
    });
  }
}
