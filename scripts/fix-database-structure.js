/**
 * Manual database structure update to properly convert Patient IDs to numerical
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDatabaseStructure() {
  console.log('🔧 Updating database structure for numerical patient IDs...');
  
  try {
    // Step 1: Check current patients and get their data
    console.log('📋 Getting current patient data...');
    const patients = await prisma.$queryRaw`
      SELECT id, new_id, name, guardianName, address, age, sex, occupation, mobileNumber, chiefComplaints, 
             medicalHistory, physicalGenerals, menstrualHistory, foodAndHabit, userId, branchId, 
             createdAt, updatedAt 
      FROM patients 
      ORDER BY new_id;
    `;
    
    const investigations = await prisma.$queryRaw`
      SELECT * FROM investigations ORDER BY createdAt;
    `;
    
    console.log(`Found ${patients.length} patients and ${investigations.length} investigations`);
    
    // Step 2: Update the database structure
    console.log('🗃️ Updating database structure...');
    
    // Disable foreign key checks temporarily
    await prisma.$executeRaw`SET foreign_key_checks = 0;`;
    
    // Step 2a: Update investigations table to use the new_id
    console.log('🔗 Updating investigation references...');
    await prisma.$executeRaw`
      UPDATE investigations i 
      JOIN patients p ON i.patientId = p.id 
      SET i.patientId = p.new_id;
    `;
    
    // Step 2b: Drop the old id column and rename new_id to id
    console.log('🔄 Restructuring patient table...');
    await prisma.$executeRaw`ALTER TABLE patients DROP PRIMARY KEY;`;
    await prisma.$executeRaw`ALTER TABLE patients DROP COLUMN id;`;
    await prisma.$executeRaw`ALTER TABLE patients CHANGE new_id id INT AUTO_INCREMENT PRIMARY KEY;`;
    
    // Step 2c: Update the investigations table structure
    console.log('📊 Updating investigations table structure...');
    await prisma.$executeRaw`ALTER TABLE investigations MODIFY COLUMN patientId INT;`;
    
    // Step 2d: Re-add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE investigations 
      ADD CONSTRAINT investigations_patientId_fkey 
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE;
    `;
    
    // Re-enable foreign key checks
    await prisma.$executeRaw`SET foreign_key_checks = 1;`;
    
    console.log('✅ Database structure updated successfully!');
    
    // Step 3: Verify the changes
    console.log('🔍 Verifying the update...');
    
    const updatedPatients = await prisma.patient.findMany({
      include: {
        investigations: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log('\n📊 Updated Results:');
    console.log(`Total patients: ${updatedPatients.length}`);
    
    let totalInvestigations = 0;
    updatedPatients.forEach(patient => {
      totalInvestigations += patient.investigations.length;
      console.log(`ID: ${patient.id} - ${patient.name} (${patient.investigations.length} investigations)`);
    });
    
    console.log(`Total investigations: ${totalInvestigations}`);
    
    console.log('\n🎉 Database structure update completed successfully!');
    console.log('📝 Patients now have numerical IDs starting from 1');
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
if (require.main === module) {
  updateDatabaseStructure()
    .catch((error) => {
      console.error('Database update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateDatabaseStructure };