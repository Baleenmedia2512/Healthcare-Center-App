import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { applyTenantScope } from '@/utils/tenantScoping';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get session and validate auth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only superadmins, clinicadmins, and branchadmins can access clinic information
  if (!['superadmin', 'clinicadmin', 'branchadmin'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Apply tenant scoping based on role
        const queryParams = {};
        
        // If not superadmin, scope to the user's clinic
        if (session.user.role !== 'superadmin' && session.user.clinicId) {
          queryParams.where = {
            id: session.user.clinicId
          };
        } else if (session.user.role === 'branchadmin' && !session.user.clinicId) {
          // Branch admin without clinic - should not happen, but handle gracefully
          return res.status(400).json({ error: 'Branch admin must be assigned to a clinic' });
        }
        
        // Include branch counts
        queryParams.include = {
          _count: {
            select: {
              branches: true,
              users: true
            }
          }
        };
        
        // Get clinics with filtered scope
        const clinics = await prisma.clinic.findMany(queryParams);
        
        return res.status(200).json(clinics);

      case 'POST':
        // Only superadmins can create new clinics
        if (session.user.role !== 'superadmin') {
          return res.status(403).json({ error: 'Forbidden - Only superadmins can create clinics' });
        }
        
        // Extract clinic data
        const { name, address, contactEmail, contactPhone, isActive = true } = req.body;
        
        // Validate required fields
        if (!name || !address || !contactEmail || !contactPhone) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create new clinic
        const newClinic = await prisma.clinic.create({
          data: {
            name,
            address,
            contactEmail,
            contactPhone,
            isActive
          }
        });
        
        return res.status(201).json(newClinic);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error in /api/clinics:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
