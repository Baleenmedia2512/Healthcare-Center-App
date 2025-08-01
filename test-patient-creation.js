const { PrismaClient } = require('@prisma/client');

// Set production database URL for testing
process.env.DATABASE_URL = 'mysql://baleeed5_mediboo:mediboo%40123%23@103.191.208.228:3306/baleeed5_mediboo';

const prisma = new PrismaClient();

async function testPatientCreation() {
  try {
    console.log('🧪 Testing enhanced patient creation with actual database records...');

    // Test data with various edge cases
    const testPatients = [
      {
        name: 'Test Patient 1',
        address: 'Test Address',
        age: 25,
        sex: 'Male',
        mobileNumber: '1234567890',
        chiefComplaints: 'Test complaints',
        medicalHistory: {
          pastHistory: {
            allergy: true,
            diabetes: false,
            cancer: false,
            anemia: false,
            arthritis: false,
            asthma: false,
            heartDisease: false,
            hypertension: false,
            thyroid: false,
            tuberculosis: false
          },
          familyHistory: {
            diabetes: true,
            cancer: false,
            hypertension: false,
            thyroid: false,
            tuberculosis: false
          }
        },
        physicalGenerals: {
          appetite: 'Good',
          bowel: 'Normal',
          urine: 'Normal',
          sweating: 'Normal',
          sleep: 'Good',
          thirst: 'Normal',
          addictions: 'None'
        },
        foodAndHabit: {
          foodHabit: 'Vegetarian',
          addictions: 'None'
        }
      },
      // Test with potentially problematic data
      {
        name: 'Test Patient 2 "Special Chars"',
        address: 'Address with "quotes" and special chars & symbols',
        age: 30,
        sex: 'Female',
        mobileNumber: '9876543210',
        chiefComplaints: 'Complaints with "quotes" and \\backslashes & symbols',
        medicalHistory: {
          pastHistory: {
            allergy: false,
            diabetes: false,
            anemia: true,
            arthritis: false,
            asthma: false,
            cancer: false,
            heartDisease: false,
            hypertension: false,
            thyroid: false,
            tuberculosis: false
          },
          familyHistory: {
            diabetes: false,
            cancer: false,
            hypertension: false,
            thyroid: false,
            tuberculosis: false
          }
        },
        physicalGenerals: {
          appetite: 'Poor',
          bowel: 'Irregular',
          urine: 'Normal',
          sweating: 'Excessive',
          sleep: 'Disturbed',
          thirst: 'Increased',
          addictions: 'None'
        },
        menstrualHistory: {
          menses: 'Regular',
          menopause: 'No',
          leucorrhoea: 'No',
          gonorrhea: 'No',
          otherDischarges: 'None'
        },
        foodAndHabit: {
          foodHabit: 'Mixed diet with "special" preferences',
          addictions: 'None'
        }
      }
    ];

    const createdPatients = [];

    for (let i = 0; i < testPatients.length; i++) {
      const patient = testPatients[i];
      console.log(`\n--- Creating Patient ${i + 1}: ${patient.name} ---`);
      
      try {
        console.log('Preparing patient data...');
        
        // Apply the same safe stringification logic from the API
        const safeJsonStringify = (data, fieldName) => {
          try {
            if (!data || typeof data !== 'object') {
              console.log(`Warning: ${fieldName} is not an object, stringifying as-is`);
              return JSON.stringify(data);
            }
            
            const stringified = JSON.stringify(data);
            
            // Validate the stringified result can be parsed back
            JSON.parse(stringified);
            
            if (stringified.includes('undefined') || stringified.includes('NaN')) {
              console.log(`Warning: ${fieldName} contains undefined/NaN values`);
            }
            
            return stringified;
          } catch (e) {
            console.error(`Error stringifying ${fieldName}:`, e.message);
            throw new Error(`Failed to safely stringify ${fieldName}: ${e.message}`);
          }
        };

        // Prepare database record with stringified JSON
        const patientData = {
          name: patient.name,
          guardianName: null,
          address: patient.address,
          age: patient.age,
          sex: patient.sex,
          occupation: null,
          mobileNumber: patient.mobileNumber,
          chiefComplaints: patient.chiefComplaints,
          medicalHistory: safeJsonStringify(patient.medicalHistory, 'medicalHistory'),
          physicalGenerals: safeJsonStringify(patient.physicalGenerals, 'physicalGenerals'),
          menstrualHistory: patient.sex === 'Female' && patient.menstrualHistory 
            ? safeJsonStringify(patient.menstrualHistory, 'menstrualHistory') 
            : null,
          foodAndHabit: safeJsonStringify(patient.foodAndHabit, 'foodAndHabit'),
          userId: 'cmdsrejia000314297r3svpue', // Dr. John Doe
          branchId: 'demo-branch-id'
        };

        console.log('JSON stringification successful:');
        console.log('- Medical History length:', patientData.medicalHistory.length);
        console.log('- Physical Generals length:', patientData.physicalGenerals.length);
        console.log('- Food and Habit length:', patientData.foodAndHabit.length);
        if (patientData.menstrualHistory) {
          console.log('- Menstrual History length:', patientData.menstrualHistory.length);
        }

        // Create the patient in database
        console.log('Creating patient in database...');
        const createdPatient = await prisma.patient.create({
          data: patientData
        });

        console.log(`✅ Patient created successfully with ID: ${createdPatient.id}`);
        createdPatients.push(createdPatient);

        // Verify we can read the data back without corruption
        console.log('Verifying data integrity...');
        const retrievedPatient = await prisma.patient.findUnique({
          where: { id: createdPatient.id },
          select: {
            id: true,
            name: true,
            medicalHistory: true,
            physicalGenerals: true,
            menstrualHistory: true,
            foodAndHabit: true
          }
        });

        // Test parsing the retrieved data
        if (retrievedPatient.medicalHistory) {
          JSON.parse(retrievedPatient.medicalHistory);
          console.log('✅ Medical History parsed successfully');
        }
        
        if (retrievedPatient.physicalGenerals) {
          JSON.parse(retrievedPatient.physicalGenerals);
          console.log('✅ Physical Generals parsed successfully');
        }
        
        if (retrievedPatient.menstrualHistory) {
          JSON.parse(retrievedPatient.menstrualHistory);
          console.log('✅ Menstrual History parsed successfully');
        }
        
        if (retrievedPatient.foodAndHabit) {
          JSON.parse(retrievedPatient.foodAndHabit);
          console.log('✅ Food and Habit parsed successfully');
        }

        console.log('✅ All JSON fields verified - no corruption detected');
        
      } catch (error) {
        console.error(`❌ Test failed for ${patient.name}:`, error.message);
        console.error('Stack trace:', error.stack);
      }
    }
    
    console.log(`\n🎉 Test completed! Created ${createdPatients.length} test patients`);
    
    if (createdPatients.length > 0) {
      console.log('\n📋 Created patients:');
      createdPatients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.name} (ID: ${patient.id})`);
      });
    }

  } catch (error) {
    console.error('💥 Test suite failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPatientCreation();
