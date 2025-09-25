/**
 * Quick verification script to check the numerical patient IDs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPatientIds() {
  try {
    console.log('🔍 Verifying numerical patient IDs...');
    
    const patients = await prisma.patient.findMany({
      include: {
        investigations: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log('\n📊 Current Patient Status:');
    console.log(`Total patients: ${patients.length}`);
    
    patients.forEach(patient => {
      console.log(`✅ Patient ID: ${patient.id} - ${patient.name} (${patient.investigations.length} investigations)`);
    });
    
    // Check if IDs are numerical
    const allNumerical = patients.every(p => typeof p.id === 'number');
    console.log(`\n🔢 All patient IDs are numerical: ${allNumerical}`);
    
    if (allNumerical) {
      console.log('🎉 SUCCESS: Patient IDs have been successfully converted to numerical format!');
      console.log('📝 New patients will continue with sequential numerical IDs.');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyPatientIds();
}

module.exports = { verifyPatientIds };