const { PrismaClient } = require('@prisma/client');

// Set production database URL
process.env.DATABASE_URL = 'mysql://baleeed5_mediboo:mediboo%40123%23@103.191.208.228:3306/baleeed5_mediboo';

const prisma = new PrismaClient();

async function fixColumnLength() {
  try {
    console.log('🔧 Fixing column length limitation...');
    
    // Apply the SQL migration directly
    console.log('Modifying medicalHistory column...');
    await prisma.$executeRaw`ALTER TABLE patients MODIFY COLUMN medicalHistory TEXT`;
    
    console.log('Modifying physicalGenerals column...');
    await prisma.$executeRaw`ALTER TABLE patients MODIFY COLUMN physicalGenerals TEXT`;
    
    console.log('Modifying menstrualHistory column...');
    await prisma.$executeRaw`ALTER TABLE patients MODIFY COLUMN menstrualHistory TEXT`;
    
    console.log('Modifying foodAndHabit column...');
    await prisma.$executeRaw`ALTER TABLE patients MODIFY COLUMN foodAndHabit TEXT`;
    
    console.log('✅ All columns updated to TEXT type');
    
    // Verify the changes
    console.log('\n🔍 Verifying column types...');
    const columnInfo = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'patients' 
      AND COLUMN_NAME IN ('medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit')
      ORDER BY COLUMN_NAME
    `;
    
    console.log('Updated column types:');
    columnInfo.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (max length: ${col.CHARACTER_MAXIMUM_LENGTH || 'unlimited'})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixColumnLength();
