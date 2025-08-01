const { PrismaClient } = require('@prisma/client');

// Set production database URL
process.env.DATABASE_URL = 'mysql://baleeed5_mediboo:mediboo%40123%23@103.191.208.228:3306/baleeed5_mediboo';

const prisma = new PrismaClient();

async function checkCorruption() {
  try {
    console.log('🔍 Checking for corrupted JSON data...');
    
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        medicalHistory: true,
        physicalGenerals: true,
        menstrualHistory: true,
        foodAndHabit: true
      }
    });
    
    console.log(`Found ${patients.length} patients total`);
    
    let corruptedCount = 0;
    const fields = ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'];
    
    for (const patient of patients) {
      console.log(`\n--- ${patient.name} (${patient.id}) ---`);
      
      for (const field of fields) {
        if (patient[field]) {
          try {
            JSON.parse(patient[field]);
            console.log(`✅ ${field}: Valid JSON`);
          } catch (e) {
            console.log(`❌ ${field}: CORRUPTED - ${e.message}`);
            console.log(`   Raw data: ${patient[field].substring(0, 200)}...`);
            corruptedCount++;
          }
        } else {
          console.log(`⚪ ${field}: NULL/Empty`);
        }
      }
    }
    
    console.log(`\n📊 Summary: ${corruptedCount} corrupted fields found`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

checkCorruption();
