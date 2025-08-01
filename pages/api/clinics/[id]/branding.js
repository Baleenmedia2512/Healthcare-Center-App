import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get session and validate auth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    // Verify the clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id },
    });
    
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    
    // Only allow access to superadmins or the clinic's own admin
    if (
      session.user.role !== 'superadmin' && 
      !(session.user.role === 'clinicadmin' && session.user.clinicId === id)
    ) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
    }

    switch (req.method) {
      case 'GET':
        // Return the clinic branding information
        return res.status(200).json({
          id: clinic.id,
          name: clinic.name,
          logoUrl: clinic.logoUrl,
          faviconUrl: clinic.faviconUrl,
          primaryColor: clinic.primaryColor,
          secondaryColor: clinic.secondaryColor,
          customCss: clinic.customCss,
          customDomain: clinic.customDomain,
        });

      case 'PUT':
        // Extract branding data
        const { 
          primaryColor, 
          secondaryColor, 
          customCss,
          customDomain 
        } = req.body;
        
        // Update clinic branding settings
        const updatedClinic = await prisma.clinic.update({
          where: { id },
          data: {
            primaryColor,
            secondaryColor,
            customCss,
            customDomain,
          },
        });
        
        return res.status(200).json(updatedClinic);

      // POST method for file uploads has been moved to /api/upload/clinic-asset

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error in /api/clinics/[id]/branding:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
