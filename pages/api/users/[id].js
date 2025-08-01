import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Only users with admin roles can access user management
  const validRoles = ['superadmin', 'clinicadmin', 'branchadmin', 'admin'];
  if (!validRoles.includes(session.user.role)) {
    return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get single user
        const user = await prisma.user.findUnique({
          where: { id },
          include: {
            clinic: {
              select: { id: true, name: true }
            },
            branch: {
              select: { id: true, name: true }
            },
            _count: {
              select: { patients: true }
            }
          }
        });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check permissions - admins can only see users within their scope
        switch (session.user.role) {
          case 'superadmin':
            // Superadmin can see any user
            break;
            
          case 'clinicadmin':
            // Clinic admin can see users in their clinic
            if (user.clinicId !== session.user.clinicId) {
              return res.status(403).json({ error: 'Forbidden - Cannot access users from other clinics' });
            }
            break;
            
          case 'branchadmin':
            // Branch admin can see users in their branch
            if (user.branchId !== session.user.branchId || user.clinicId !== session.user.clinicId) {
              return res.status(403).json({ error: 'Forbidden - Cannot access users from other branches' });
            }
            break;
            
          default:
            // Legacy admin can see any user
            break;
        }

        // Remove password hash from response
        const { hashedPassword, ...safeUser } = user;
        return res.status(200).json(safeUser);

      case 'PUT':
        // Extract update data
        const { 
          email: updateEmail, 
          fullName: updateFullName, 
          password: updatePassword,
          role: updateRole,
          clinicId: updateClinicId = null,
          branchId: updateBranchId = null,
          isActive: updateIsActive = true
        } = req.body;

        // Find the user to update
        const userToUpdate = await prisma.user.findUnique({
          where: { id }
        });

        if (!userToUpdate) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check permissions - admins can only update users within their scope
        switch (session.user.role) {
          case 'superadmin':
            // Superadmin can update any user
            break;
            
          case 'clinicadmin':
            // Clinic admin can update users in their clinic
            if (userToUpdate.clinicId !== session.user.clinicId) {
              return res.status(403).json({ error: 'Forbidden - Cannot update users from other clinics' });
            }
            break;
            
          case 'branchadmin':
            // Branch admin can update users in their branch
            if (userToUpdate.branchId !== session.user.branchId || userToUpdate.clinicId !== session.user.clinicId) {
              return res.status(403).json({ error: 'Forbidden - Cannot update users from other branches' });
            }
            
            // Branch admin can only update doctors
            if (userToUpdate.role !== 'doctor') {
              return res.status(403).json({ error: 'Forbidden - Branch admins can only update doctors' });
            }
            break;
            
          default:
            // Legacy admin can update any user
            break;
        }

        // Validate role-specific permissions for the new role if it's being changed
        if (updateRole && updateRole !== userToUpdate.role) {
          switch (session.user.role) {
            case 'superadmin':
              // Superadmin can change any role
              break;
              
            case 'clinicadmin':
              // Clinic admin can change roles within their clinic
              if (!['branchadmin', 'doctor'].includes(updateRole)) {
                return res.status(403).json({ error: 'Forbidden - Cannot assign this role' });
              }
              break;
              
            case 'branchadmin':
              // Branch admin cannot change roles
              return res.status(403).json({ error: 'Forbidden - Branch admins cannot change user roles' });
              
            default:
              // Legacy admin can change any role
              break;
          }
        }

        // Check if email is already in use by another user
        if (updateEmail && updateEmail !== userToUpdate.email) {
          const existingUserWithEmail = await prisma.user.findUnique({
            where: { email: updateEmail }
          });
          
          if (existingUserWithEmail && existingUserWithEmail.id !== id) {
            return res.status(400).json({ error: 'Email is already in use' });
          }
        }

        // Validate clinic and branch IDs if provided
        if (updateClinicId) {
          const clinic = await prisma.clinic.findUnique({
            where: { id: updateClinicId }
          });
          if (!clinic) {
            return res.status(400).json({ error: 'Invalid clinic ID' });
          }
        }

        if (updateBranchId) {
          const branch = await prisma.branch.findUnique({
            where: { id: updateBranchId }
          });
          if (!branch) {
            return res.status(400).json({ error: 'Invalid branch ID' });
          }
          
          // Ensure branch belongs to the specified clinic
          if (updateClinicId && branch.clinicId !== updateClinicId) {
            return res.status(400).json({ error: 'Branch does not belong to the specified clinic' });
          }
        }

        // Prepare update data
        const updateData = {};
        if (updateEmail !== undefined) updateData.email = updateEmail;
        if (updateFullName !== undefined) updateData.fullName = updateFullName;
        if (updateRole !== undefined) updateData.role = updateRole;
        if (updateClinicId !== undefined) updateData.clinicId = updateClinicId || null;
        if (updateBranchId !== undefined) updateData.branchId = updateBranchId || null;
        if (updateIsActive !== undefined) updateData.isActive = updateIsActive;

        // Hash new password if provided
        if (updatePassword) {
          updateData.hashedPassword = await bcrypt.hash(updatePassword, 10);
        }

        // Update user
        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData
        });

        // Remove the password hash from response
        const { hashedPassword: __, ...safeUpdatedUser } = updatedUser;

        return res.status(200).json(safeUpdatedUser);

      case 'DELETE':
        // Find the user to delete
        const userToDelete = await prisma.user.findUnique({
          where: { id }
        });

        if (!userToDelete) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check permissions - admins can only delete users within their scope
        switch (session.user.role) {
          case 'superadmin':
            // Superadmin can delete any user
            break;
            
          case 'clinicadmin':
            // Clinic admin can delete users in their clinic
            if (userToDelete.clinicId !== session.user.clinicId) {
              return res.status(403).json({ error: 'Forbidden - Cannot delete users from other clinics' });
            }
            break;
            
          case 'branchadmin':
            // Branch admin can delete users in their branch
            if (userToDelete.branchId !== session.user.branchId || userToDelete.clinicId !== session.user.clinicId) {
              return res.status(403).json({ error: 'Forbidden - Cannot delete users from other branches' });
            }
            
            // Branch admin can only delete doctors
            if (userToDelete.role !== 'doctor') {
              return res.status(403).json({ error: 'Forbidden - Branch admins can only delete doctors' });
            }
            break;
            
          default:
            // Legacy admin can delete any user
            break;
        }

        // Delete user
        await prisma.user.delete({
          where: { id }
        });

        return res.status(200).json({ message: 'User deleted successfully' });
        
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Database error:', error);
    
    // Provide more specific error messages for common foreign key constraint violations
    if (error.code === 'P2003') {
      const fieldName = error.meta?.field_name || 'foreign key';
      let message = 'Foreign key constraint violation';
      
      if (fieldName.includes('clinic') || error.message.includes('clinic')) {
        message = 'Invalid clinic ID - the specified clinic does not exist';
      } else if (fieldName.includes('branch') || error.message.includes('branch')) {
        message = 'Invalid branch ID - the specified branch does not exist';
      }
      
      return res.status(400).json({ 
        error: message,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database operation failed'
    });
  } finally {
    await prisma.$disconnect();
  }
}
