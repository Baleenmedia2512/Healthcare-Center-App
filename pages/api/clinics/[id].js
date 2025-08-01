import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get clinic ID from the request
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing clinic ID' });
  }

  // Get session and validate auth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify user has access to this clinic
  const canAccess = 
    session.user.role === 'superadmin' || 
    (session.user.role === 'clinicadmin' && session.user.clinicId === id);
  
  if (!canAccess) {
    return res.status(403).json({ error: 'Forbidden - You do not have access to this clinic' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get clinic details with counts of branches, users and patients
        const clinic = await prisma.clinic.findUnique({
          where: { id },
          include: {
            branches: true,
            _count: {
              select: {
                branches: true,
                users: true
              }
            }
          }
        });
        
        if (!clinic) {
          return res.status(404).json({ error: 'Clinic not found' });
        }
        
        return res.status(200).json(clinic);

      case 'PUT':
        // Only superadmins can update clinics
        if (session.user.role !== 'superadmin') {
          return res.status(403).json({ error: 'Forbidden - Only superadmins can update clinics' });
        }
        
        // Extract clinic data
        const { name, address, contactEmail, contactPhone, isActive } = req.body;
        
        // Validate required fields
        if (!name || !address || !contactEmail || !contactPhone) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Update clinic
        const updatedClinic = await prisma.clinic.update({
          where: { id },
          data: {
            name,
            address,
            contactEmail,
            contactPhone,
            isActive: isActive !== undefined ? isActive : true
          }
        });
        
        return res.status(200).json(updatedClinic);

      case 'DELETE':
        // Only superadmins can delete clinics
        if (session.user.role !== 'superadmin') {
          return res.status(403).json({ error: 'Forbidden - Only superadmins can delete clinics' });
        }
        
        // Check if clinic has any branches or users
        const clinicToDelete = await prisma.clinic.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                branches: true,
                users: true
              }
            }
          }
        });
        
        if (!clinicToDelete) {
          return res.status(404).json({ error: 'Clinic not found' });
        }
        
        // Prevent deletion if clinic has branches or users
        if (clinicToDelete._count.branches > 0 || clinicToDelete._count.users > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete clinic', 
            message: 'Please remove all branches and users from this clinic first'
          });
        }
        
        // Delete clinic
        await prisma.clinic.delete({
          where: { id }
        });
        
        return res.status(200).json({ success: true, message: 'Clinic deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error(`Error in /api/clinics/${id}:`, error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
