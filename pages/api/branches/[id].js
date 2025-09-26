import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get branch ID from the request
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing branch ID' });
  }

  // Get session and validate auth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // First, get the branch to check permissions
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        clinic: true
      }
    });
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    // Verify user has access to this branch
    const canAccess = 
      session.user.role === 'superadmin' || 
      (session.user.role === 'clinicadmin' && session.user.clinicId === branch.clinicId) ||
      (session.user.role === 'branchadmin' && session.user.branchId === id);
    
    if (!canAccess) {
      return res.status(403).json({ error: 'Forbidden - You do not have access to this branch' });
    }

    switch (req.method) {
      case 'GET':
        // Get branch details with related data
        const branchDetails = await prisma.branch.findUnique({
          where: { id },
          include: {
            clinic: {
              select: {
                id: true,
                name: true
              }
            },
            users: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true
              }
            },
            _count: {
              select: {
                users: true
              }
            }
          }
        });
        
        return res.status(200).json(branchDetails);

      case 'PUT':
        // Only superadmins and clinicadmins can update branches
        const canUpdate = 
          session.user.role === 'superadmin' || 
          (session.user.role === 'clinicadmin' && session.user.clinicId === branch.clinicId);
        
        if (!canUpdate) {
          return res.status(403).json({ error: 'Forbidden - Insufficient permissions to update branch' });
        }
        
        // Extract branch data
        const { name, address, contactEmail, contactPhone, isActive, clinicId } = req.body;
        
        // Validate required fields
        if (!name || !address || !contactEmail || !contactPhone) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // If changing clinic, verify permissions
        if (clinicId && clinicId !== branch.clinicId && session.user.role !== 'superadmin') {
          return res.status(403).json({ error: 'Forbidden - Cannot change branch clinic' });
        }
        
        // Update branch
        const updatedBranch = await prisma.branch.update({
          where: { id },
          data: {
            name,
            address,
            contactEmail,
            contactPhone,
            isActive: isActive !== undefined ? isActive : true,
            ...(clinicId && session.user.role === 'superadmin' ? { clinicId } : {})
          }
        });
        
        return res.status(200).json(updatedBranch);

      case 'DELETE':
        // Only superadmins and clinicadmins can delete branches
        const canDelete = 
          session.user.role === 'superadmin' || 
          (session.user.role === 'clinicadmin' && session.user.clinicId === branch.clinicId);
        
        if (!canDelete) {
          return res.status(403).json({ error: 'Forbidden - Insufficient permissions to delete branch' });
        }
        
        // Check if branch has any users
        const branchToDelete = await prisma.branch.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                users: true
              }
            }
          }
        });
        
        // Prevent deletion if branch has users
        if (branchToDelete._count.users > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete branch', 
            message: 'Please remove all users from this branch first'
          });
        }
        
        // Delete branch
        await prisma.branch.delete({
          where: { id }
        });
        
        return res.status(200).json({ success: true, message: 'Branch deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error(`Error in /api/branches/${id}:`, error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
