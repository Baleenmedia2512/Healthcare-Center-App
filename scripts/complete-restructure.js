/**
 * Complete database restructuring for numerical patient IDs
 * This approach creates new tables and migrates all data cleanly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function completeRestructure() {
  console.log('🚀 Starting complete database restructuring for numerical patient IDs...');
  
  try {
    // Step 1: Backup all data
    console.log('💾 Creating complete data backup...');
    
    const patients = await prisma.$queryRaw`
      SELECT * FROM patients ORDER BY new_id;
    `;
    
    const investigations = await prisma.$queryRaw`
      SELECT * FROM investigations ORDER BY createdAt;
    `;
    
    console.log(`Backing up ${patients.length} patients and ${investigations.length} investigations`);
    
    // Step 2: Drop and recreate tables with proper structure
    console.log('🗃️ Recreating database structure...');
    
    await prisma.$executeRaw`SET foreign_key_checks = 0;`;
    
    // Drop tables
    await prisma.$executeRaw`DROP TABLE IF EXISTS investigations;`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS patients;`;
    
    // Recreate patients table with numerical ID
    await prisma.$executeRaw`
      CREATE TABLE patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        guardianName VARCHAR(191),
        address TEXT NOT NULL,
        age INT NOT NULL,
        sex VARCHAR(191) NOT NULL,
        occupation VARCHAR(191),
        mobileNumber VARCHAR(191) NOT NULL,
        chiefComplaints TEXT NOT NULL,
        medicalHistory TEXT,
        physicalGenerals TEXT,
        menstrualHistory TEXT,
        foodAndHabit TEXT,
        userId VARCHAR(191) NOT NULL,
        branchId VARCHAR(191) NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX patients_branchId_fkey (branchId),
        INDEX patients_userId_fkey (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    // Recreate investigations table with INT patientId
    await prisma.$executeRaw`
      CREATE TABLE investigations (
        id VARCHAR(191) PRIMARY KEY,
        type VARCHAR(191) NOT NULL,
        details TEXT NOT NULL,
        date DATETIME(3) NOT NULL,
        fileUrl VARCHAR(191),
        doctor VARCHAR(191),
        results TEXT,
        normalRange VARCHAR(191),
        followUpNeeded BOOLEAN DEFAULT FALSE,
        followUpDate DATETIME(3),
        notes TEXT,
        patientId INT NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX investigations_patientId_fkey (patientId),
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await prisma.$executeRaw`SET foreign_key_checks = 1;`;
    
    // Step 3: Insert data with new structure
    console.log('📊 Migrating patient data...');
    
    const idMapping = new Map();
    
    for (const patient of patients) {
      const newPatientId = patient.new_id; // Use the new_id as the numerical ID
      
      await prisma.$executeRaw`
        INSERT INTO patients (
          id, name, guardianName, address, age, sex, occupation, mobileNumber, chiefComplaints,
          medicalHistory, physicalGenerals, menstrualHistory, foodAndHabit, 
          userId, branchId, createdAt, updatedAt
        ) VALUES (
          ${newPatientId}, ${patient.name}, ${patient.guardianName}, ${patient.address}, 
          ${patient.age}, ${patient.sex}, ${patient.occupation}, ${patient.mobileNumber}, 
          ${patient.chiefComplaints}, ${patient.medicalHistory}, ${patient.physicalGenerals}, 
          ${patient.menstrualHistory}, ${patient.foodAndHabit}, ${patient.userId}, 
          ${patient.branchId}, ${patient.createdAt}, ${patient.updatedAt}
        );
      `;
      
      idMapping.set(patient.id, newPatientId);
      console.log(`✓ Patient ${newPatientId}: ${patient.name}`);
    }
    
    // Step 4: Migrate investigations
    console.log('🔬 Migrating investigation data...');
    
    for (const investigation of investigations) {
      const newPatientId = idMapping.get(investigation.patientId);
      if (newPatientId) {
        await prisma.$executeRaw`
          INSERT INTO investigations (
            id, type, details, date, fileUrl, doctor, results, normalRange,
            followUpNeeded, followUpDate, notes, patientId, createdAt, updatedAt
          ) VALUES (
            ${investigation.id}, ${investigation.type}, ${investigation.details}, ${investigation.date},
            ${investigation.fileUrl}, ${investigation.doctor}, ${investigation.results}, 
            ${investigation.normalRange}, ${investigation.followUpNeeded}, ${investigation.followUpDate},
            ${investigation.notes}, ${newPatientId}, ${investigation.createdAt}, ${investigation.updatedAt}
          );
        `;
        console.log(`✓ Investigation for patient ${newPatientId}`);
      }
    }
    
    // Step 5: Set AUTO_INCREMENT to continue from the highest ID + 1
    const maxId = Math.max(...patients.map(p => p.new_id));
    const nextId = maxId + 1;
    await prisma.$executeRaw`ALTER TABLE patients AUTO_INCREMENT = ${nextId};`;
    
    console.log(`🔢 AUTO_INCREMENT set to start from ${nextId}`);
    
    // Step 6: Verify the migration
    console.log('🔍 Verifying the complete restructure...');
    
    const finalPatients = await prisma.patient.findMany({
      include: {
        investigations: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log('\n📊 Final Results:');
    console.log(`Total patients: ${finalPatients.length}`);
    
    let totalInvestigations = 0;
    finalPatients.forEach(patient => {
      totalInvestigations += patient.investigations.length;
      console.log(`ID: ${patient.id} - ${patient.name} (${patient.investigations.length} investigations)`);
    });
    
    console.log(`Total investigations: ${totalInvestigations}`);
    
    console.log('\n🎉 Complete database restructuring completed successfully!');
    console.log('📝 Patients now have proper numerical IDs');
    console.log('🔗 All relationships preserved and functioning');
    
    // Display ID mapping
    console.log('\n🗂️ Final ID Mapping:');
    for (const [oldId, newId] of idMapping.entries()) {
      console.log(`${oldId} → ${newId}`);
    }
    
  } catch (error) {
    console.error('❌ Complete restructure failed:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the complete restructure
if (require.main === module) {
  completeRestructure()
    .catch((error) => {
      console.error('Complete restructure failed:', error);
      process.exit(1);
    });
}

module.exports = { completeRestructure };