const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkForeignKeys() {
  try {
    // Check investigations table for any non-numeric patientId values
    const investigations = await prisma.investigation.findMany({
      select: { id: true, patientId: true },
      take: 5
    });
    
    console.log('Investigation patientId types:');
    investigations.forEach(inv => {
      console.log(`Investigation ${inv.id}: patientId=${inv.patientId} (type: ${typeof inv.patientId})`);
    });
    
    // Check if all investigations have valid patient references by checking for orphaned records
    const totalInvestigations = await prisma.investigation.count();
    const investigationsWithPatients = await prisma.investigation.count({
      where: {
        patient: {
          isNot: null
        }
      }
    });
    
    const orphanedInvestigations = totalInvestigations - investigationsWithPatients;
    
    if (orphanedInvestigations > 0) {
      console.log(`\nFound ${orphanedInvestigations} investigations with invalid patient references`);
    } else {
      console.log('\nAll investigations have valid patient references ✓');
    }
    
    console.log(`\nTotal investigations: ${totalInvestigations}`);
    console.log(`Investigations with valid patients: ${investigationsWithPatients}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkForeignKeys();