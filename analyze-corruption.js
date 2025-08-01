const { PrismaClient } = require('@prisma/client');

// Set production database URL
process.env.DATABASE_URL = 'mysql://baleeed5_mediboo:mediboo%40123%23@103.191.208.228:3306/baleeed5_mediboo';

const prisma = new PrismaClient();

async function analyzeCorruption() {
  try {
    console.log('🔍 Analyzing JSON corruption in Loki patient...');
    
    // Get the raw data for Loki
    const loki = await prisma.patient.findFirst({
      where: { name: 'Loki' },
      select: {
        id: true,
        name: true,
        medicalHistory: true,
        physicalGenerals: true,
        menstrualHistory: true,
        foodAndHabit: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!loki) {
      console.log('❌ Loki patient not found');
      return;
    }
    
    console.log('📋 Loki Patient Data:');
    console.log(`ID: ${loki.id}`);
    console.log(`Created: ${loki.createdAt}`);
    console.log(`Updated: ${loki.updatedAt}`);
    console.log('');
    
    // Analyze each JSON field
    const fields = ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'];
    
    for (const field of fields) {
      const value = loki[field];
      console.log(`🔍 ${field}:`);
      
      if (!value) {
        console.log('   ➖ NULL or empty');
        continue;
      }
      
      console.log(`   📏 Length: ${value.length} characters`);
      console.log(`   📄 Raw data: ${value.substring(0, 250)}${value.length > 250 ? '...' : ''}`);
      
      try {
        const parsed = JSON.parse(value);
        console.log('   ✅ Valid JSON');
        console.log(`   📊 Parsed keys: ${Object.keys(parsed).join(', ')}`);
      } catch (e) {
        console.log(`   ❌ Invalid JSON: ${e.message}`);
        console.log(`   🔍 Error at position: ${e.message.match(/position (\\d+)/)?.[1] || 'unknown'}`);
        
        // Find the problematic character
        const pos = parseInt(e.message.match(/position (\\d+)/)?.[1] || '0');
        if (pos > 0 && pos < value.length) {
          const start = Math.max(0, pos - 20);
          const end = Math.min(value.length, pos + 20);
          console.log(`   🎯 Context around error:`);
          console.log(`      "${value.substring(start, pos)}[HERE->${value.charAt(pos)}<-HERE]${value.substring(pos + 1, end)}"`);
        }
      }
      console.log('');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

analyzeCorruption();
