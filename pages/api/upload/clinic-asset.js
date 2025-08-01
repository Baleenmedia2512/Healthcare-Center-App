import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

// Configure formidable to parse files
export const config = {
  api: {
    bodyParser: false,
  },
};

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
const ensureStorageDirs = async () => {
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

export default async function handler(req, res) {
  // Get session and validate auth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Ensure storage directories exist
    await ensureStorageDirs();

    // Parse form data with formidable
    const form = new IncomingForm({
      keepExtensions: true,
      multiples: false,
    });

    const formData = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = formData;
    const uploadedFile = files.file;
    const clinicId = fields.clinicId[0];
    const type = fields.type[0]; // 'logo' or 'favicon'
    
    // Validate clinic ID
    if (!clinicId) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    // Check if user has permission
    if (session.user.role !== 'superadmin' && 
        !(session.user.role === 'clinicadmin' && session.user.clinicId === clinicId)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    // Verify the clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });
    
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Create subdirectory based on type
    const subDir = type === 'favicon' ? 'favicons' : 'logos';
    const clinicDir = path.join(CLINIC_ASSETS_DIR, subDir, clinicId);
    
    if (!(await exists(clinicDir))) {
      await mkdir(clinicDir, { recursive: true });
    }
    
    // Get file info
    const fileObj = uploadedFile[0];
    const fileExt = path.extname(fileObj.originalFilename);
    const fileName = `${Date.now()}${fileExt}`;
    const targetPath = path.join(clinicDir, fileName);
    const relativePath = `${subDir}/${clinicId}/${fileName}`;
    
    // Read file and write to target location
    const fileData = await fs.promises.readFile(fileObj.filepath);
    await fs.promises.writeFile(targetPath, fileData);
    
    // Generate public URL
    const publicUrl = `/uploads/clinic-assets/${relativePath}`;
    
    // Determine which field to update based on file type
    const fieldToUpdate = type === 'favicon' ? 'faviconUrl' : 'logoUrl';
    
    // If replacing an existing file, delete the old one
    if (clinic[fieldToUpdate]) {
      try {
        // Extract path from URL
        const oldPath = clinic[fieldToUpdate].replace('/uploads/clinic-assets/', '');
        const fullOldPath = path.join(CLINIC_ASSETS_DIR, oldPath);
        
        if (await exists(fullOldPath)) {
          await unlink(fullOldPath);
        }
      } catch (err) {
        console.error('Error deleting old file:', err);
        // Continue even if deleting old file fails
      }
    }
    
    // Update clinic with new file URL
    const updatedClinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        [fieldToUpdate]: publicUrl,
      },
    });
    
    return res.status(200).json({
      success: true,
      url: publicUrl,
      clinic: updatedClinic
    });
    
  } catch (error) {
    console.error('Error handling file upload:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
