const { PrismaClient } = require('@prisma/client');

// Set production database URL
process.env.DATABASE_URL = 'mysql://baleeed5_mediboo:mediboo%40123%23@103.191.208.228:3306/baleeed5_mediboo';

const prisma = new PrismaClient();

async function analyzeCorruptionPattern() {
  try {
    console.log('🔍 Analyzing corruption patterns and root causes...');
    
    // Check if we can find any pattern in the database
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        medicalHistory: true,
        physicalGenerals: true,
        menstrualHistory: true,
        foodAndHabit: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📊 Analyzing ${patients.length} patients...`);
    
    for (const patient of patients) {
      console.log(`\n--- ${patient.name} (Created: ${patient.createdAt}) ---`);
      
      const fields = ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'];
      
      for (const field of fields) {
        if (patient[field]) {
          console.log(`${field}: ${patient[field].length} chars`);
          
          // Check for common corruption patterns
          const data = patient[field];
          
          // Pattern 1: Missing quotes around property names
          if (data.includes('{pastHistory:') || data.includes('{familyHistory:')) {
            console.log(`⚠️  Pattern 1: Missing quotes in property names`);
          }
          
          // Pattern 2: Unescaped quotes
          if (data.includes('\\"') && !data.includes('"\\"')) {
            console.log(`⚠️  Pattern 2: Potential unescaped quotes`);
          }
          
          // Pattern 3: Truncated JSON
          const openBraces = (data.match(/{/g) || []).length;
          const closeBraces = (data.match(/}/g) || []).length;
          if (openBraces !== closeBraces) {
            console.log(`⚠️  Pattern 3: Unmatched braces (${openBraces} open, ${closeBraces} close)`);
          }
          
          // Pattern 4: Check if JSON ends properly
          if (!data.trim().endsWith('}') && !data.trim().endsWith(']')) {
            console.log(`⚠️  Pattern 4: JSON doesn't end properly`);
            console.log(`   Last 50 chars: ...${data.slice(-50)}`);
          }
          
          // Try to parse and show exact error location
          try {
            JSON.parse(data);
            console.log(`✅ ${field}: Valid JSON`);
          } catch (e) {
            console.log(`❌ ${field}: ${e.message}`);
            
            // Show the problematic area
            const match = e.message.match(/position (\d+)/);
            if (match) {
              const pos = parseInt(match[1]);
              const start = Math.max(0, pos - 20);
              const end = Math.min(data.length, pos + 20);
              console.log(`   Problem area: "${data.slice(start, end)}"`);
              console.log(`   Character at position ${pos}: "${data[pos]}" (ASCII: ${data.charCodeAt(pos)})`);
            }
          }
        } else {
          console.log(`${field}: NULL/Empty`);
        }
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

analyzeCorruptionPattern();
