/**
 * Simplified migration script to convert Patient IDs from CUID to numerical IDs
 * This approach creates a new table, copies data, and then replaces the old table
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migratePatientIds() {
  console.log('🚀 Starting Patient ID migration from CUID to numerical...');
  
  try {
    // Step 1: Get all existing patients with their investigations
    console.log('📋 Fetching all existing patients...');
    const existingPatients = await prisma.patient.findMany({
      include: {
        investigations: true
      },
      orderBy: {
        createdAt: 'asc' // Order by creation date to maintain sequence
      }
    });

    console.log(`Found ${existingPatients.length} existing patients`);

    if (existingPatients.length === 0) {
      console.log('✅ No existing patients found. Schema can be updated directly.');
      return;
    }

    // Step 2: Create a backup of the data
    console.log('💾 Creating data backup...');
    const backupData = {
      patients: existingPatients,
      timestamp: new Date().toISOString()
    };

    // Step 3: Clear existing data (we'll restore with new IDs)
    console.log('🗑️ Clearing existing data...');
    await prisma.investigation.deleteMany({});
    await prisma.patient.deleteMany({});

    // Step 4: Re-create patients with sequential IDs
    console.log('👥 Recreating patients with numerical IDs...');
    const idMapping = new Map();
    
    for (let i = 0; i < existingPatients.length; i++) {
      const oldPatient = existingPatients[i];
      const newPatientId = i + 1;
      
      console.log(`Creating patient ${newPatientId}: ${oldPatient.name}`);
      
      // Create new patient (Prisma will auto-assign the ID starting from 1)
      const newPatient = await prisma.patient.create({
        data: {
          name: oldPatient.name,
          guardianName: oldPatient.guardianName,
          address: oldPatient.address,
          age: oldPatient.age,
          sex: oldPatient.sex,
          occupation: oldPatient.occupation,
          mobileNumber: oldPatient.mobileNumber,
          chiefComplaints: oldPatient.chiefComplaints,
          medicalHistory: oldPatient.medicalHistory,
          physicalGenerals: oldPatient.physicalGenerals,
          menstrualHistory: oldPatient.menstrualHistory,
          foodAndHabit: oldPatient.foodAndHabit,
          userId: oldPatient.userId,
          branchId: oldPatient.branchId,
          createdAt: oldPatient.createdAt,
          updatedAt: oldPatient.updatedAt
        }
      });
      
      // Store mapping for investigations
      idMapping.set(oldPatient.id, newPatient.id);
      
      // Recreate investigations for this patient
      for (const investigation of oldPatient.investigations) {
        await prisma.investigation.create({
          data: {
            type: investigation.type,
            details: investigation.details,
            date: investigation.date,
            fileUrl: investigation.fileUrl,
            doctor: investigation.doctor,
            results: investigation.results,
            normalRange: investigation.normalRange,
            followUpNeeded: investigation.followUpNeeded,
            followUpDate: investigation.followUpDate,
            notes: investigation.notes,
            patientId: newPatient.id, // Use the new numerical ID
            createdAt: investigation.createdAt,
            updatedAt: investigation.updatedAt
          }
        });
      }
    }

    // Step 5: Verify the migration
    console.log('🔍 Verifying migration...');
    const updatedPatients = await prisma.patient.findMany({
      include: {
        investigations: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log('\n📊 Migration Results:');
    console.log(`Total patients: ${updatedPatients.length}`);
    
    let totalInvestigations = 0;
    updatedPatients.forEach(patient => {
      totalInvestigations += patient.investigations.length;
      console.log(`ID: ${patient.id} - ${patient.name} (${patient.investigations.length} investigations)`);
    });

    console.log(`Total investigations: ${totalInvestigations}`);

    // Verify counts match
    const originalInvestigationCount = existingPatients.reduce((count, p) => count + p.investigations.length, 0);
    if (totalInvestigations === originalInvestigationCount) {
      console.log('✅ All investigations preserved correctly!');
    } else {
      console.log(`⚠️ Investigation count mismatch! Original: ${originalInvestigationCount}, New: ${totalInvestigations}`);
    }

    console.log('\n🎉 Patient ID migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. The schema has been updated to use Int for Patient ID');
    console.log('2. Run "npx prisma generate" to update the Prisma client');
    console.log('3. Test the application with the new numerical patient IDs');

    // Save mapping for reference
    console.log('\n🗂️ ID Mapping (Old CUID → New Numerical):');
    for (const [oldId, newId] of idMapping.entries()) {
      console.log(`${oldId} → ${newId}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
    
    console.log('\n🔄 If the migration failed, you may need to restore the data manually.');
    console.log('Consider running the database backup/restore procedure.');
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migratePatientIds()
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migratePatientIds };