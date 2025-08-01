import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { patientId } = req.query;

        let investigations;
        if (patientId) {
          console.log('Fetching investigations for patient ID:', patientId);
          // Get investigations for specific patient
          investigations = await prisma.investigation.findMany({
            where: {
              patientId: patientId,
              // Make this optional during development to simplify testing
              ...(process.env.NODE_ENV === 'production' ? {
                patient: {
                  userId: session.user.id
                }
              } : {})
            },
            include: {
              patient: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              date: 'desc'
            }
          });
        } else {
          // Get all investigations for user's patients
          investigations = await prisma.investigation.findMany({
            where: {
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
            },
            orderBy: {
              date: 'desc'
            }
          });
        }

        return res.status(200).json(investigations);

      case 'POST':
        const { 
          patientId: newPatientId, 
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
        
        console.log('Investigation POST request received:', JSON.stringify(req.body, null, 2));

        // Validate required fields with better error handling
        if (!newPatientId) {
          return res.status(400).json({ 
            error: 'Missing required field',
            message: 'Patient ID is required',
            details: 'The patientId field is missing or invalid'
          });
        }
        
        if (!details) {
          return res.status(400).json({ 
            error: 'Missing required field',
            message: 'Investigation details are required',
            details: 'The details field is missing or invalid'
          });
        }
        
        if (!date) {
          return res.status(400).json({ 
            error: 'Missing required field',
            message: 'Date is required',
            details: 'The date field is missing or invalid'
          });
        }

        try {
          // Verify patient belongs to user - make this optional in development
          let patient;
          if (process.env.NODE_ENV === 'production') {
            patient = await prisma.patient.findFirst({
              where: {
                id: newPatientId,
                userId: session.user.id
              }
            });
          } else {
            patient = await prisma.patient.findUnique({
              where: {
                id: newPatientId
              }
            });
          }

          if (!patient) {
            return res.status(404).json({ error: 'Patient not found', details: `Patient with ID ${newPatientId} not found` });
          }

          console.log('Creating investigation for patient:', patient.name);
          
          // Parse date strings to Date objects
          let parsedDate = new Date(date);
          let parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;
          
          if (isNaN(parsedDate.getTime())) {
            console.error('Invalid date format:', date);
            parsedDate = new Date(); // Fallback to current date
          }
          
          if (followUpDate && isNaN(parsedFollowUpDate.getTime())) {
            console.error('Invalid followUpDate format:', followUpDate);
            parsedFollowUpDate = null;
          }

          const newInvestigation = await prisma.investigation.create({
            data: {
              type: type || "General", // Set a default type if none provided
              details,
              date: parsedDate,
              fileUrl: fileUrl || null,
              doctor: doctor || null,
              results: results || null,
              normalRange: normalRange || null,
              followUpNeeded: followUpNeeded || false,
              followUpDate: parsedFollowUpDate,
              notes: notes || null,
              patientId: newPatientId
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
          
          console.log('Investigation created successfully:', newInvestigation.id);
          return res.status(201).json(newInvestigation);
        } catch (error) {
          console.error('Error creating investigation:', error);
          return res.status(500).json({
            error: 'Failed to create investigation',
            message: error.message,
            details: JSON.stringify(error)
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
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
