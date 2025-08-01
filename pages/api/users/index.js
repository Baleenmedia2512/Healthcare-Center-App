import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import bcrypt from 'bcryptjs';
import { applyTenantScope } from '@/utils/tenantScoping';

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

  try {
    switch (req.method) {
      case 'GET':
        // Apply tenant scoping based on role
        let queryParams = {};
        
        // Determine which users this admin can see
        switch (session.user.role) {
          case 'superadmin':
            // Superadmin can see all users
            break;
            
          case 'clinicadmin':
            // Clinic admin can see users in their clinic
            if (session.user.clinicId) {
              queryParams.where = {
                clinicId: session.user.clinicId
              };
            }
            break;
            
          case 'branchadmin':
            // Branch admin can see users in their branch
            if (session.user.branchId) {
              queryParams.where = {
                branchId: session.user.branchId
              };
            }
            break;
            
          case 'admin': 
            // Legacy support - admin can see all users
            break;
        }
        
        // Include clinic and branch info
        queryParams.select = {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          clinicId: true,
          branchId: true,
          clinic: {
            select: {
              id: true,
              name: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              patients: true
            }
          }
        };
        
        queryParams.orderBy = {
          createdAt: 'desc'
        };
        
        // Get users with filtered scope
        const users = await prisma.user.findMany(queryParams);
        
        // Transform data to match frontend expectations
        const transformedUsers = users.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          clinicId: user.clinicId,
          branchId: user.branchId,
          clinicName: user.clinic?.name,
          branchName: user.branch?.name,
          patientCount: user._count.patients
        }));
        
        return res.status(200).json(transformedUsers);
        
      case 'POST':
        // Extract user data
        const { 
          email, 
          fullName, 
          password, 
          role = 'doctor',
          clinicId = null,
          branchId = null,
          isActive = true
        } = req.body;
        
        // Validate required fields
        if (!email || !fullName || !password) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Validate permissions based on user role and new user role
        switch (session.user.role) {
          case 'superadmin':
            // Superadmin can create any user
            break;
            
          case 'clinicadmin':
            // Clinic admin can create branch admins and doctors within their clinic
            if (!['branchadmin', 'doctor'].includes(role)) {
              return res.status(403).json({ error: 'Forbidden - Cannot create users with this role' });
            }
            
            // Ensure user is assigned to the admin's clinic
            if (clinicId !== session.user.clinicId) {
              return res.status(403).json({ error: 'Forbidden - Cannot create users for other clinics' });
            }
            break;
            
          case 'branchadmin':
            // Branch admin can only create doctors within their branch
            if (role !== 'doctor') {
              return res.status(403).json({ error: 'Forbidden - Branch admins can only create doctors' });
            }
            
            // Ensure user is assigned to the admin's branch and clinic
            if (clinicId !== session.user.clinicId || branchId !== session.user.branchId) {
              return res.status(403).json({ error: 'Forbidden - Cannot create users for other branches' });
            }
            break;
            
          default:
            // Legacy admin can create any user
            break;
        }
        
        // Validate role-specific requirements
        if ((role === 'branchadmin' || role === 'doctor') && !branchId) {
          return res.status(400).json({ error: 'Branch administrators and doctors must be assigned to a branch' });
        }
        
        if ((role === 'clinicadmin' || role === 'branchadmin' || role === 'doctor') && !clinicId) {
          return res.status(400).json({ error: 'Clinic administrators, branch administrators, and doctors must be assigned to a clinic' });
        }
        
        // Validate that clinicId exists if provided
        if (clinicId) {
          const clinic = await prisma.clinic.findUnique({
            where: { id: clinicId }
          });
          if (!clinic) {
            return res.status(400).json({ error: 'Invalid clinic ID' });
          }
        }
        
        // Validate that branchId exists if provided
        if (branchId) {
          const branch = await prisma.branch.findUnique({
            where: { id: branchId }
          });
          if (!branch) {
            return res.status(400).json({ error: 'Invalid branch ID' });
          }
          
          // Ensure branch belongs to the specified clinic
          if (clinicId && branch.clinicId !== clinicId) {
            return res.status(400).json({ error: 'Branch does not belong to the specified clinic' });
          }
        }
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: {
            email
          }
        });
        
        if (existingUser) {
          return res.status(400).json({ error: 'Email is already in use' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = await prisma.user.create({
          data: {
            email,
            fullName,
            hashedPassword,
            role,
            clinicId: clinicId || null, // Convert empty string to null
            branchId: branchId || null, // Convert empty string to null
            isActive
          }
        });
        
        // Remove the password hash from response
        const { hashedPassword: _, ...safeNewUser } = newUser;
        
        return res.status(201).json(safeNewUser);
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
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
