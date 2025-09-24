import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Build dashboard statistics based on user role and tenant info
    const userRole = session.user.role;
    const clinicId = session.user.clinicId;
    const branchId = session.user.branchId;
    
    // Default stats object
    const stats = {
      userCount: 0,
      patientCount: 0,
      investigationCount: 0,
      recentActivity: 0,
      myPatientCount: 0,
      recentCases: 0,
      pendingReports: 0,
      clinicCount: 0,
      branchCount: 0,
      todaysAppointments: 0
    };
    
    // Common date filter for "recent" items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Apply scope based on role
    switch (userRole) {
      case 'superadmin':
        // SuperAdmin gets global stats
        try {
          stats.userCount = await prisma.user.count();
          stats.patientCount = await prisma.patient.count();
          stats.investigationCount = await prisma.investigation.count();
          stats.clinicCount = await prisma.clinic.count();
          stats.branchCount = await prisma.branch.count();
          
          // Recent activity = new patients in the last 30 days
          stats.recentActivity = await prisma.patient.count({
            where: {
              createdAt: {
                gte: thirtyDaysAgo
              }
            }
          });
        } catch (error) {
          console.error('Error fetching superadmin stats:', error);
          // Keep default values
        }
        break;
        
      case 'clinicadmin':
        if (clinicId) {
          // Find all branches in this clinic
          const clinicBranches = await prisma.branch.findMany({
            where: {
              clinicId: clinicId
            },
            select: {
              id: true
            }
          });
          
          const branchIds = clinicBranches.map(branch => branch.id);
          
          // Clinic admin sees stats for their clinic
          stats.userCount = await prisma.user.count({
            where: {
              clinicId: clinicId
            }
          });
          
          stats.branchCount = branchIds.length;
          
          stats.patientCount = await prisma.patient.count({
            where: {
              branchId: {
                in: branchIds
              }
            }
          });
          
          stats.investigationCount = await prisma.investigation.count({
            where: {
              patient: {
                branchId: {
                  in: branchIds
                }
              }
            }
          });
          
          stats.recentActivity = await prisma.patient.count({
            where: {
              branchId: {
                in: branchIds
              },
              createdAt: {
                gte: thirtyDaysAgo
              }
            }
          });
        }
        break;
        
      case 'branchadmin':
        if (branchId) {
          // Branch admin sees stats for their branch
          stats.userCount = await prisma.user.count({
            where: {
              branchId: branchId
            }
          });
          
          stats.patientCount = await prisma.patient.count({
            where: {
              branchId: branchId
            }
          });
          
          stats.investigationCount = await prisma.investigation.count({
            where: {
              patient: {
                branchId: branchId
              }
            }
          });
          
          stats.recentActivity = await prisma.patient.count({
            where: {
              branchId: branchId,
              createdAt: {
                gte: thirtyDaysAgo
              }
            }
          });
        }
        break;
        
      case 'doctor':
      default:
        // Doctor sees their own stats
        stats.myPatientCount = await prisma.patient.count({
          where: {
            userId: session.user.id
          }
        });
        
        stats.investigationCount = await prisma.investigation.count({
          where: {
            patient: {
              userId: session.user.id
            }
          }
        });
        
        stats.recentCases = await prisma.patient.count({
          where: {
            userId: session.user.id,
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        });
        
        stats.pendingReports = await prisma.investigation.count({
          where: {
            patient: {
              userId: session.user.id
            },
            followUpNeeded: true,
            followUpDate: {
              gt: new Date()
            }
          }
        });

        // Today's appointments count
        const today = new Date();
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        stats.todaysAppointments = await prisma.investigation.count({
          where: {
            patient: {
              userId: session.user.id
            },
            followUpNeeded: true,
            followUpDate: {
              gte: startOfToday,
              lte: endOfToday
            }
          }
        });
        break;
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  } finally {
    await prisma.$disconnect();
  }
}
