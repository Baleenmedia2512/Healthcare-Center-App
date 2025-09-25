const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPatients() {
  try {
    const patients = await prisma.patient.findMany({
      select: { id: true, name: true },
      take: 10
    });
    
    console.log('Total patients found:', patients.length);
    console.log('Patient details:');
    patients.forEach(p => {
      console.log(`ID: ${p.id} (type: ${typeof p.id}) - Name: ${p.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatients();