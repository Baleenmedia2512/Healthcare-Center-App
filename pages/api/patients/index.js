import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { applyTenantScope, hasAccessToResource } from '@/utils/tenantScoping';

const prisma = new PrismaClient();

// Helper function to validate and sanitize patient data
const validateAndSanitizePatientData = (data) => {
  console.log('Validating patient data:', data);
  
  const {
    name,
    guardianName,
    address,
    age,
    sex,
    occupation,
    mobileNumber,
    chiefComplaints,
    medicalHistory,
    physicalGenerals,
    menstrualHistory,
    foodAndHabit,
    userId // Extract userId if present
  } = data;

  // Required fields validation with detailed error messages
  const errors = [];
  if (!name || typeof name !== 'string' || !name.trim()) 
    errors.push('Name is required');
  if (!address || typeof address !== 'string' || !address.trim()) 
    errors.push('Address is required');
  if (age === undefined || age === null || age === '' || isNaN(parseInt(age))) 
    errors.push('Age is required and must be a number');
  if (!sex || (sex !== 'Male' && sex !== 'Female' && sex !== 'Other')) 
    errors.push('Sex is required (Male, Female, or Other)');
  
  // Additional validation for the commonly failing fields
  if (!mobileNumber) {
    errors.push('Mobile number is required');
    console.error('Mobile number validation failed: empty value');
  } else if (typeof mobileNumber !== 'string') {
    errors.push('Mobile number must be a string');
    console.error('Mobile number validation failed: not a string', typeof mobileNumber);
  } else if (!mobileNumber.trim()) {
    errors.push('Mobile number cannot be empty');
    console.error('Mobile number validation failed: empty string');
  }
  
  if (!chiefComplaints) {
    errors.push('Chief complaints are required');
    console.error('Chief complaints validation failed: empty value');
  } else if (typeof chiefComplaints !== 'string') {
    errors.push('Chief complaints must be a string');
    console.error('Chief complaints validation failed: not a string', typeof chiefComplaints);
  } else if (!chiefComplaints.trim()) {
    errors.push('Chief complaints cannot be empty');
    console.error('Chief complaints validation failed: empty string');
  }

  // Additional validations
  if (typeof age === 'number' && (age <= 0 || age > 150)) {
    errors.push('Age must be between 1 and 150');
  }
  
  if (mobileNumber && !/^[0-9-+()\\s]+$/.test(mobileNumber)) {
    errors.push('Mobile number contains invalid characters');
  }

  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    return { valid: false, errors };
  }

  // Create default values for optional JSON fields
  const defaultMedicalHistory = {
    pastHistory: {
      allergy: false, anemia: false, arthritis: false, asthma: false,
      cancer: false, diabetes: false, heartDisease: false, hypertension: false,
      thyroid: false, tuberculosis: false
    },
    familyHistory: {
      diabetes: false, hypertension: false, thyroid: false,
      tuberculosis: false, cancer: false
    }
  };
  
  const defaultPhysicalGenerals = {
    appetite: '', bowel: '', urine: '', sweating: '', 
    sleep: '', thirst: '', addictions: ''
  };
  
  const defaultFoodAndHabit = {
    foodHabit: '',
    addictions: ''
  };
  
  const defaultMenstrualHistory = sex === 'Female' ? {
    menses: '', menopause: 'No', leucorrhoea: '',
    gonorrhea: 'No', otherDischarges: ''
  } : null;

  // Safe parsing of JSON fields
  let sanitizedMedicalHistory;
  let sanitizedPhysicalGenerals;
  let sanitizedMenstrualHistory;
  let sanitizedFoodAndHabit;

  try {
    sanitizedMedicalHistory = medicalHistory 
      ? (typeof medicalHistory === 'string' ? JSON.parse(medicalHistory) : medicalHistory) 
      : defaultMedicalHistory;
  } catch (e) {
    console.log('Error parsing medicalHistory:', e);
    sanitizedMedicalHistory = defaultMedicalHistory;
  }

  try {
    sanitizedPhysicalGenerals = physicalGenerals 
      ? (typeof physicalGenerals === 'string' ? JSON.parse(physicalGenerals) : physicalGenerals) 
      : defaultPhysicalGenerals;
  } catch (e) {
    console.log('Error parsing physicalGenerals:', e);
    sanitizedPhysicalGenerals = defaultPhysicalGenerals;
  }

  try {
    sanitizedMenstrualHistory = sex === 'Female' && menstrualHistory 
      ? (typeof menstrualHistory === 'string' ? JSON.parse(menstrualHistory) : menstrualHistory) 
      : defaultMenstrualHistory;
  } catch (e) {
    console.log('Error parsing menstrualHistory:', e);
    sanitizedMenstrualHistory = defaultMenstrualHistory;
  }

  try {
    sanitizedFoodAndHabit = foodAndHabit 
      ? (typeof foodAndHabit === 'string' ? JSON.parse(foodAndHabit) : foodAndHabit) 
      : defaultFoodAndHabit;
  } catch (e) {
    console.log('Error parsing foodAndHabit:', e);
    sanitizedFoodAndHabit = defaultFoodAndHabit;
  }

  console.log('Data sanitization complete');

  // Prepare the sanitized data
  const sanitizedData = {
    name: name.trim(),
    guardianName: guardianName ? guardianName.trim() : null,
    address: address.trim(),
    age: parseInt(age),
    sex,
    occupation: occupation ? occupation.trim() : null,
    mobileNumber: mobileNumber.trim(),
    chiefComplaints: chiefComplaints.trim(),
    stringifiedMedicalHistory: JSON.stringify(sanitizedMedicalHistory),
    stringifiedPhysicalGenerals: JSON.stringify(sanitizedPhysicalGenerals),
    stringifiedMenstrualHistory: sex === 'Female' ? JSON.stringify(sanitizedMenstrualHistory) : null,
    stringifiedFoodAndHabit: JSON.stringify(sanitizedFoodAndHabit)
  };
  
  // If userId is provided, include it in the sanitized data
  if (userId) {
    console.log('User ID provided in data:', userId);
    sanitizedData.userId = userId;
  }

  return {
    valid: true,
    sanitizedData
  };
};

export default async function handler(req, res) {
  console.log(`API Request: ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  
  // Log request body for POST and PUT requests
  if (['POST', 'PUT'].includes(req.method)) {
    console.log('Request body:', JSON.stringify(req.body));
  }
  
  const session = await getServerSession(req, res, authOptions);
  console.log('Session from getServerSession:', JSON.stringify(session));

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Use the tenant scoping utility to build the query
        const queryParams = applyTenantScope(
          {
            include: {
              investigations: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  fullName: true,
                  role: true
                }
              },
              branch: {
                select: {
                  id: true,
                  name: true,
                  clinic: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          session,
          { includePatientFilter: true }
        );
        
        const patients = await prisma.patient.findMany(queryParams);

        // Transform data to match frontend expectations
        const transformedPatients = patients.map(patient => {
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
          
          return {
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
        });

        return res.status(200).json(transformedPatients);

      case 'POST':
        console.log('POST /api/patients - Request received');
        console.log('Request body:', req.body);
        
        try {
          // Check for empty required fields before validation
          if (!req.body.mobileNumber) {
            console.log('Mobile number missing in request');
            return res.status(400).json({
              error: 'Validation error',
              message: 'Mobile number is required',
              details: 'Mobile number field is missing or empty'
            });
          }
          
          if (!req.body.chiefComplaints) {
            console.log('Chief complaints missing in request');
            return res.status(400).json({
              error: 'Validation error',
              message: 'Chief complaints are required',
              details: 'Chief complaints field is missing or empty'
            });
          }
          
          // Validate and sanitize patient data
          const validationResult = validateAndSanitizePatientData(req.body);
          
          // If validation fails, return error
          if (!validationResult.valid) {
            console.log('Patient data validation failed:', validationResult.errors);
            return res.status(400).json({
              error: 'Validation error',
              message: 'Please check the form for errors',
              details: validationResult.errors.join(', ')
            });
          }
          
          console.log('Patient data validated successfully');
          
          const {
            name,
            guardianName,
            address,
            age,
            sex,
            occupation,
            mobileNumber,
            chiefComplaints,
            stringifiedMedicalHistory,
            stringifiedPhysicalGenerals,
            stringifiedMenstrualHistory,
            stringifiedFoodAndHabit
          } = validationResult.sanitizedData;
          
          // Create the patient record
          console.log('Creating patient record in database with data:', {
            name, guardianName, address, age, sex, occupation, 
            mobileNumber, chiefComplaints,
            hasMedicalHistory: !!stringifiedMedicalHistory,
            hasPhysicalGenerals: !!stringifiedPhysicalGenerals,
            hasMenstrualHistory: !!stringifiedMenstrualHistory,
            hasFoodAndHabit: !!stringifiedFoodAndHabit
          });
          
          // Debug session information
          console.log('Session object:', JSON.stringify(session));
          console.log('User object:', JSON.stringify(session.user));
          console.log('User ID:', session.user?.id);
          
          // Check if userId is available
          if (!session.user || !session.user.id) {
            console.error('User session missing or invalid', JSON.stringify(session));
            // If user ID is missing but we have a session, try to use it anyway
            if (session && session.user && session.user.email) {
              console.log('Attempting to find user by email:', session.user.email);
              // Try to find the user by email
              const user = await prisma.user.findUnique({
                where: {
                  email: session.user.email
                }
              });
              
              if (user) {
                console.log('Found user by email:', user.id);
                session.user.id = user.id; // Set the ID
              } else {
                console.error('Could not find user by email');
                return res.status(400).json({
                  error: 'Authentication error',
                  message: 'Unable to save patient',
                  details: 'User ID is missing and could not be retrieved'
                });
              }
            } else {
              return res.status(400).json({
                error: 'Authentication error',
                message: 'Unable to save patient',
                details: 'User ID is missing or invalid'
              });
            }
          }
          
          // Make sure user has a branch assigned
          if (!session.user.branchId) {
            return res.status(400).json({
              error: 'Missing branch',
              message: 'You must be assigned to a branch to register patients',
              details: 'User is not associated with any branch'
            });
          }
          
          // Prepare data for patient creation
          const patientData = {
            name,
            guardianName,
            address,
            age,
            sex,
            occupation,
            mobileNumber,
            chiefComplaints,
            medicalHistory: stringifiedMedicalHistory,
            physicalGenerals: stringifiedPhysicalGenerals,
            menstrualHistory: stringifiedMenstrualHistory,
            foodAndHabit: stringifiedFoodAndHabit,
            // Use the userId field directly
            userId: session.user.id,
            // Add branch information
            branchId: session.user.branchId
          };
          
          console.log('Final patient data for creation:', JSON.stringify(patientData));
          
          const newPatient = await prisma.patient.create({
            data: patientData,
            include: {
              investigations: true
            }
          });
          
          console.log('Patient created successfully:', newPatient.id);
          
          // Parse the JSON fields back for the response
          const transformedNewPatient = {
            ...newPatient,
            medicalHistory: stringifiedMedicalHistory ? JSON.parse(stringifiedMedicalHistory) : null,
            physicalGenerals: stringifiedPhysicalGenerals ? JSON.parse(stringifiedPhysicalGenerals) : null,
            menstrualHistory: stringifiedMenstrualHistory ? JSON.parse(stringifiedMenstrualHistory) : null,
            foodAndHabit: stringifiedFoodAndHabit ? JSON.parse(stringifiedFoodAndHabit) : null
          };

          return res.status(201).json(transformedNewPatient);
        } catch (error) {
          console.error('Error creating patient:', error);
          // Enhanced error response with more details
          return res.status(400).json({
            error: 'Failed to create patient',
            message: 'Unable to save patient',
            details: error.message || 'Database error occurred',
            code: error.code
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    // Enhanced error logging
    const errorMessage = error.message || 'Unknown database error';
    const errorDetails = error.meta && error.meta.cause ? error.meta.cause : 'No additional details';
    const errorCode = error.code || 'UNKNOWN_ERROR';
    
    console.log('Request body:', req.body);
    console.log('Error details:', {
      message: errorMessage,
      details: errorDetails,
      code: errorCode,
      stack: error.stack
    });
    
    return res.status(400).json({ 
      error: 'Invalid request data',
      message: errorMessage,
      details: errorDetails,
      code: errorCode
    });
  } finally {
    await prisma.$disconnect();
  }
}
