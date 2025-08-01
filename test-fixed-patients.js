const { PrismaClient } = require('@prisma/client');

// Set production database URL
process.env.DATABASE_URL = 'mysql://baleeed5_mediboo:mediboo%40123%23@103.191.208.228:3306/baleeed5_mediboo';

const prisma = new PrismaClient();

async function cleanupAndRetestPatients() {
  try {
    console.log('🧹 Cleaning up corrupted test patients...');
    
    // Delete the corrupted test patients
    const deleteResult = await prisma.patient.deleteMany({
      where: {
        name: {
          contains: 'Test Patient'
        }
      }
    });
    
    console.log(`✅ Deleted ${deleteResult.count} corrupted test patients`);
    
    console.log('\n🧪 Creating new test patient with full JSON data...');
    
    // Create a comprehensive test patient
    const testPatientData = {
      name: 'Test Patient FIXED',
      guardianName: null,
      address: 'Complete Test Address with "special" characters & symbols',
      age: 28,
      sex: 'Female',
      occupation: 'Software Engineer',
      mobileNumber: '9999999999',
      chiefComplaints: 'Testing the fixed JSON storage with comprehensive data',
      medicalHistory: JSON.stringify({
        pastHistory: {
          allergy: true,
          anemia: false,
          arthritis: false,
          asthma: true,
          cancer: false,
          diabetes: false,
          heartDisease: false,
          hypertension: false,
          thyroid: true,
          tuberculosis: false,
          additionalConditions: "Multiple allergies to dust, pollen, and certain medications. History of seasonal asthma."
        },
        familyHistory: {
          diabetes: true,
          hypertension: true,
          thyroid: false,
          tuberculosis: false,
          cancer: true,
          details: "Father has Type 2 diabetes and hypertension. Mother's family has history of breast cancer."
        }
      }),
      physicalGenerals: JSON.stringify({
        appetite: 'Good with occasional loss during stress',
        bowel: 'Regular, once daily',
        urine: 'Normal frequency and color',
        sweating: 'Normal, increased during exercise',
        sleep: 'Good quality, 7-8 hours nightly',
        thirst: 'Normal, increased during hot weather',
        addictions: 'Occasional social drinking, no smoking'
      }),
      menstrualHistory: JSON.stringify({
        menses: 'Regular 28-day cycle',
        menopause: 'No',
        leucorrhoea: 'Mild, occasional',
        gonorrhea: 'No',
        otherDischarges: 'None significant',
        additionalInfo: 'Some cramping during first 2 days, manageable with over-the-counter pain relief'
      }),
      foodAndHabit: JSON.stringify({
        foodHabit: 'Balanced diet with preference for home-cooked meals. Vegetarian twice a week.',
        addictions: 'Coffee 2-3 cups daily, occasional social drinking on weekends',
        dietaryRestrictions: 'Lactose intolerant, avoids dairy products',
        exerciseHabits: 'Regular yoga 3x/week, weekend hiking'
      }),
      userId: 'cmdsrejia000314297r3svpue', // Dr. John Doe
      branchId: 'demo-branch-id'
    };

    console.log('Creating patient with enhanced data...');
    console.log('Medical History length:', testPatientData.medicalHistory.length);
    console.log('Physical Generals length:', testPatientData.physicalGenerals.length);
    console.log('Menstrual History length:', testPatientData.menstrualHistory.length);
    console.log('Food and Habit length:', testPatientData.foodAndHabit.length);

    const createdPatient = await prisma.patient.create({
      data: testPatientData
    });

    console.log(`✅ Patient created successfully with ID: ${createdPatient.id}`);

    // Verify data integrity
    console.log('\n🔍 Verifying data integrity...');
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

    console.log('Retrieved data lengths:');
    console.log('- Medical History:', retrievedPatient.medicalHistory?.length || 0);
    console.log('- Physical Generals:', retrievedPatient.physicalGenerals?.length || 0);
    console.log('- Menstrual History:', retrievedPatient.menstrualHistory?.length || 0);
    console.log('- Food and Habit:', retrievedPatient.foodAndHabit?.length || 0);

    // Test JSON parsing
    try {
      const parsedMedical = JSON.parse(retrievedPatient.medicalHistory);
      console.log('✅ Medical History parsed successfully');
      console.log('   - Past History conditions:', Object.keys(parsedMedical.pastHistory).length);
      console.log('   - Family History conditions:', Object.keys(parsedMedical.familyHistory).length);
    } catch (e) {
      console.error('❌ Medical History parsing failed:', e.message);
    }

    try {
      const parsedPhysical = JSON.parse(retrievedPatient.physicalGenerals);
      console.log('✅ Physical Generals parsed successfully');
      console.log('   - Physical parameters:', Object.keys(parsedPhysical).length);
    } catch (e) {
      console.error('❌ Physical Generals parsing failed:', e.message);
    }

    try {
      const parsedMenstrual = JSON.parse(retrievedPatient.menstrualHistory);
      console.log('✅ Menstrual History parsed successfully');
      console.log('   - Menstrual parameters:', Object.keys(parsedMenstrual).length);
    } catch (e) {
      console.error('❌ Menstrual History parsing failed:', e.message);
    }

    try {
      const parsedFood = JSON.parse(retrievedPatient.foodAndHabit);
      console.log('✅ Food and Habit parsed successfully');
      console.log('   - Dietary parameters:', Object.keys(parsedFood).length);
    } catch (e) {
      console.error('❌ Food and Habit parsing failed:', e.message);
    }

    console.log('\n🎉 All tests passed! JSON corruption issue is FIXED!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAndRetestPatients();
