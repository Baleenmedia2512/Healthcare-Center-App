import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow doctors to access appointments
  if (session.user.role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied. Doctor role required.' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { date } = req.query;

        if (!date) {
          return res.status(400).json({ error: 'Date parameter is required' });
        }

        // Parse the date and create start/end of day
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Find investigations with follow-up appointments on the selected date
        const appointments = await prisma.investigation.findMany({
          where: {
            followUpNeeded: true,
            followUpDate: {
              gte: startOfDay,
              lte: endOfDay
            },
            patient: {
              userId: session.user.id // Only show appointments for doctor's patients
            }
          },
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                mobileNumber: true,
                age: true,
                sex: true,
                address: true
              }
            }
          },
          orderBy: [
            {
              followUpDate: 'asc'
            },
            {
              createdAt: 'desc'
            }
          ]
        });

        return res.status(200).json(appointments);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Appointments API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch appointments'
    });
  } finally {
    await prisma.$disconnect();
  }
}