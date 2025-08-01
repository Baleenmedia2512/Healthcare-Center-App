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
    return res.status(400).json({ error: 'Invalid patient ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const patient = await prisma.patient.findFirst({
          where: {
            id: id,
            userId: session.user.id
          },
          include: {
            investigations: {
              orderBy: {
                date: 'desc'
              }
            },
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true
              }
            }
          }
        });

        if (!patient) {
          return res.status(404).json({ error: 'Patient not found' });
        }

        // Transform data to match frontend expectations
        // Parse JSON fields stored as strings
        const medicalHistory = patient.medicalHistory ? JSON.parse(patient.medicalHistory) : {
          pastHistory: {
            allergy: false,
            anemia: false,
            arthritis: false,
            asthma: false,
            cancer: false,
            diabetes: false,
            heartDisease: false,
            hypertension: false,
            thyroid: false,
            tuberculosis: false,
          },
          familyHistory: {
            diabetes: false,
            hypertension: false,
            thyroid: false,
            tuberculosis: false,
            cancer: false,
          }
        };
        
        const physicalGenerals = patient.physicalGenerals ? JSON.parse(patient.physicalGenerals) : {
          appetite: '',
          bowel: '',
          urine: '',
          sweating: '',
          sleep: '',
          thirst: '',
          addictions: '',
        };
        
        const menstrualHistory = patient.menstrualHistory ? JSON.parse(patient.menstrualHistory) : 
          (patient.sex === 'Female' ? {
            menses: '',
            menopause: 'No',
            leucorrhoea: '',
            gonorrhea: 'No',
            otherDischarges: '',
          } : null);
          
        const foodAndHabit = patient.foodAndHabit ? JSON.parse(patient.foodAndHabit) : {
          foodHabit: '',
          addictions: '',
        };
        
        const transformedPatient = {
          id: patient.id,
          name: patient.name,
          guardianName: patient.guardianName,
          address: patient.address,
          age: patient.age,
          sex: patient.sex,
          occupation: patient.occupation || '',
          mobileNumber: patient.mobileNumber,
          chiefComplaints: patient.chiefComplaints,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
          userId: patient.userId,
          medicalHistory,
          physicalGenerals,
          menstrualHistory,
          foodAndHabit,
          investigations: patient.investigations || [],
          user: patient.user
        };

        return res.status(200).json(transformedPatient);

      case 'PUT':
        // Check if patient belongs to user
        const existingPatient = await prisma.patient.findFirst({
          where: {
            id: id,
            userId: session.user.id
          }
        });

        if (!existingPatient) {
          return res.status(404).json({ error: 'Patient not found' });
        }

        const {
          name,
          guardianName,
          address,
          age,
          sex,
          occupation,
          mobileNumber,
          chiefComplaints,
          medicalHistory: requestMedicalHistory,
          physicalGenerals: requestPhysicalGenerals,
          menstrualHistory: requestMenstrualHistory,
          foodAndHabit: requestFoodAndHabit
        } = req.body;

        // Stringify JSON fields for SQLite storage
        const stringifiedMedicalHistory = requestMedicalHistory !== undefined 
          ? JSON.stringify(requestMedicalHistory) 
          : existingPatient.medicalHistory;
          
        const stringifiedPhysicalGenerals = requestPhysicalGenerals !== undefined 
          ? JSON.stringify(requestPhysicalGenerals) 
          : existingPatient.physicalGenerals;
          
        const stringifiedMenstrualHistory = requestMenstrualHistory !== undefined 
          ? JSON.stringify(requestMenstrualHistory) 
          : existingPatient.menstrualHistory;
          
        const stringifiedFoodAndHabit = requestFoodAndHabit !== undefined 
          ? JSON.stringify(requestFoodAndHabit) 
          : existingPatient.foodAndHabit;

        const updatedPatient = await prisma.patient.update({
          where: { id: id },
          data: {
            name: name || existingPatient.name,
            guardianName: guardianName !== undefined ? guardianName : existingPatient.guardianName,
            address: address || existingPatient.address,
            age: age ? parseInt(age) : existingPatient.age,
            sex: sex || existingPatient.sex,
            occupation: occupation !== undefined ? occupation : existingPatient.occupation,
            mobileNumber: mobileNumber || existingPatient.mobileNumber,
            chiefComplaints: chiefComplaints || existingPatient.chiefComplaints,
            medicalHistory: stringifiedMedicalHistory,
            physicalGenerals: stringifiedPhysicalGenerals,
            menstrualHistory: stringifiedMenstrualHistory,
            foodAndHabit: stringifiedFoodAndHabit,
          },
          include: {
            investigations: {
              orderBy: {
                date: 'desc'
              }
            }
          }
        });
        
        // Parse the JSON fields back for the response
        const transformedUpdatedPatient = {
          ...updatedPatient,
          medicalHistory: updatedPatient.medicalHistory ? JSON.parse(updatedPatient.medicalHistory) : null,
          physicalGenerals: updatedPatient.physicalGenerals ? JSON.parse(updatedPatient.physicalGenerals) : null,
          menstrualHistory: updatedPatient.menstrualHistory ? JSON.parse(updatedPatient.menstrualHistory) : null,
          foodAndHabit: updatedPatient.foodAndHabit ? JSON.parse(updatedPatient.foodAndHabit) : null
        };

        return res.status(200).json(transformedUpdatedPatient);

      case 'DELETE':
        // Only admins can delete patients
        if (session.user.role !== 'admin') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        // Check if patient belongs to user
        const patientToDelete = await prisma.patient.findFirst({
          where: {
            id: id,
            userId: session.user.id
          }
        });

        if (!patientToDelete) {
          return res.status(404).json({ error: 'Patient not found' });
        }

        await prisma.patient.delete({
          where: { id: id }
        });

        return res.status(200).json({ message: 'Patient deleted successfully' });

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
