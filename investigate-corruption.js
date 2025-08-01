const { PrismaClient } = require('@prisma/client');

// Set production database URL
process.env.DATABASE_URL = 'mysql://baleeed5_mediboo:mediboo%40123%23@103.191.208.228:3306/baleeed5_mediboo';

const prisma = new PrismaClient();

async function investigateCorruption() {
  try {
    console.log('🔍 Investigating the corruption in newly created test patients...');
    
    // Get the test patients we just created
    const testPatients = await prisma.patient.findMany({
      where: {
        name: {
          contains: 'Test Patient'
        }
      },
      select: {
        id: true,
        name: true,
        medicalHistory: true,
        physicalGenerals: true,
        menstrualHistory: true,
        foodAndHabit: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`Found ${testPatients.length} test patients`);

    for (const patient of testPatients) {
      console.log(`\n--- Analyzing ${patient.name} (${patient.id}) ---`);
      console.log(`Created: ${patient.createdAt}`);
      
      const fields = ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'];
      
      for (const field of fields) {
        if (patient[field]) {
          console.log(`\n${field}:`);
          console.log(`Length: ${patient[field].length} characters`);
          console.log(`First 100 chars: ${patient[field].substring(0, 100)}`);
          console.log(`Last 100 chars: ${patient[field].substring(patient[field].length - 100)}`);
          
          // Check the area around position 191 where corruption occurs
          if (patient[field].length > 191) {
            const problemArea = patient[field].substring(180, 200);
            console.log(`Problem area (chars 180-200): "${problemArea}"`);
            
            // Show character codes around position 191
            for (let i = 190; i <= 194 && i < patient[field].length; i++) {
              const char = patient[field][i];
              console.log(`Position ${i}: '${char}' (ASCII: ${char.charCodeAt(0)})`);
            }
          }
          
          // Try to parse and show exact error
          try {
            JSON.parse(patient[field]);
            console.log(`✅ ${field}: Valid JSON`);
          } catch (e) {
            console.log(`❌ ${field}: ${e.message}`);
          }
        } else {
          console.log(`${field}: NULL/Empty`);
        }
      }
    }

    // Let's also check the raw bytes using a direct query
    console.log('\n🔬 Raw database investigation...');
    
    const rawResult = await prisma.$queryRaw`
      SELECT id, name, 
             HEX(medicalHistory) as medicalHistory_hex,
             CHAR_LENGTH(medicalHistory) as medicalHistory_length,
             medicalHistory
      FROM patients 
      WHERE name LIKE '%Test Patient%' 
      ORDER BY createdAt DESC 
      LIMIT 2
    `;

    for (const row of rawResult) {
      console.log(`\n--- Raw data for ${row.name} ---`);
      console.log(`Medical History Length: ${row.medicalHistory_length}`);
      console.log(`Medical History (first 200 chars): ${row.medicalHistory ? row.medicalHistory.substring(0, 200) : 'NULL'}`);
      if (row.medicalHistory_hex) {
        console.log(`Hex dump (first 100 bytes): ${row.medicalHistory_hex.substring(0, 200)}`);
      }
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateCorruption();
