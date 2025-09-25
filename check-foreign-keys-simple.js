const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkForeignKeys() {
  try {
    // Check investigations table for patientId types
    const investigations = await prisma.investigation.findMany({
      select: { id: true, patientId: true },
      take: 10
    });
    
    console.log('Investigation patientId values:');
    investigations.forEach(inv => {
      console.log(`Investigation ${inv.id}: patientId=${inv.patientId} (type: ${typeof inv.patientId})`);
    });
    
    console.log(`\nTotal investigations checked: ${investigations.length}`);
    
    // Check if we can successfully query investigations with patients
    const investigationsWithPatients = await prisma.investigation.findMany({
      include: {
        patient: {
          select: { id: true, name: true }
        }
      },
      take: 5
    });
    
    console.log('\nInvestigations with patient data:');
    investigationsWithPatients.forEach(inv => {
      console.log(`Investigation ${inv.id}: Patient ${inv.patient?.id} - ${inv.patient?.name || 'No patient'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkForeignKeys();