import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid investigation ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const investigation = await prisma.investigation.findFirst({
          where: {
            id: id,
            patient: {
              userId: session.user.id
            }
          },
          include: {
            patient: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        if (!investigation) {
          return res.status(404).json({ error: 'Investigation not found' });
        }

        return res.status(200).json(investigation);

      case 'PUT':
        // Check if investigation belongs to user's patient
        const existingInvestigation = await prisma.investigation.findFirst({
          where: {
            id: id,
            patient: {
              userId: session.user.id
            }
          }
        });

        if (!existingInvestigation) {
          return res.status(404).json({ error: 'Investigation not found' });
        }

        const { 
          type, 
          details, 
          date, 
          fileUrl,
          doctor,
          results,
          normalRange,
          followUpNeeded,
          followUpDate,
          notes 
        } = req.body;

        const updatedInvestigation = await prisma.investigation.update({
          where: { id: id },
          data: {
            type: type || existingInvestigation.type,
            details: details || existingInvestigation.details,
            date: date ? new Date(date) : existingInvestigation.date,
            fileUrl: fileUrl !== undefined ? fileUrl : existingInvestigation.fileUrl,
            doctor: doctor !== undefined ? doctor : existingInvestigation.doctor,
            results: results !== undefined ? results : existingInvestigation.results,
            normalRange: normalRange !== undefined ? normalRange : existingInvestigation.normalRange,
            followUpNeeded: followUpNeeded !== undefined ? followUpNeeded : existingInvestigation.followUpNeeded,
            followUpDate: followUpDate ? new Date(followUpDate) : existingInvestigation.followUpDate,
            notes: notes !== undefined ? notes : existingInvestigation.notes,
          },
          include: {
            patient: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        return res.status(200).json(updatedInvestigation);

      case 'DELETE':
        // Check if investigation belongs to user's patient
        const investigationToDelete = await prisma.investigation.findFirst({
          where: {
            id: id,
            patient: {
              userId: session.user.id
            }
          }
        });

        if (!investigationToDelete) {
          return res.status(404).json({ error: 'Investigation not found' });
        }

        await prisma.investigation.delete({
          where: { id: id }
        });

        return res.status(200).json({ message: 'Investigation deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database operation failed'
    });
  } finally {
    await prisma.$disconnect();
  }
}
