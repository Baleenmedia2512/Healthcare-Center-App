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

  try {
    switch (req.method) {
      case 'GET':
        // Apply tenant scoping based on role
        let queryParams = {
          include: {
            clinic: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: {
                users: true
              }
            }
          }
        };
        
        // Apply role-based filtering
        switch (session.user.role) {
          case 'superadmin':
            // Superadmin sees all branches
            break;
            
          case 'clinicadmin':
            // Clinic admin sees branches in their clinic
            if (session.user.clinicId) {
              queryParams.where = {
                clinicId: session.user.clinicId
              };
            }
            break;
            
          case 'branchadmin':
          case 'doctor':
          default:
            // Branch admin and doctors see only their branch
            if (session.user.branchId) {
              queryParams.where = {
                id: session.user.branchId
              };
            }
            break;
        }
        
        // Get branches with filtered scope
        const branches = await prisma.branch.findMany(queryParams);
        
        return res.status(200).json(branches);

      case 'POST':
        // Only superadmins and clinicadmins can create branches
        if (!['superadmin', 'clinicadmin'].includes(session.user.role)) {
          return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Insufficient permissions to create a branch'
          });
        }
        
        // Extract branch data
        const { name, address, contactEmail, contactPhone, clinicId, isActive = true } = req.body;
        
        // Validate required fields
        if (!name || !address || !contactEmail || !contactPhone || !clinicId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // For clinicadmins, verify they are creating a branch for their clinic
        if (session.user.role === 'clinicadmin' && clinicId !== session.user.clinicId) {
          return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'You can only create branches for your own clinic'
          });
        }
        
        // Create new branch
        const newBranch = await prisma.branch.create({
          data: {
            name,
            address,
            contactEmail,
            contactPhone,
            isActive,
            clinicId
          }
        });
        
        return res.status(201).json(newBranch);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error in /api/branches:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
