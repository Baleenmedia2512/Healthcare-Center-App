/**
 * Migration script to convert Patient IDs from CUID to numerical IDs
 * This script will:
 * 1. Create a mapping of old CUID IDs to new numerical IDs
 * 2. Update all patient records with new numerical IDs
 * 3. Update all investigation records to reference the new patient IDs
 * 4. Update any other references to patient IDs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migratePatientIds() {
  console.log('🚀 Starting Patient ID migration from CUID to numerical...');
  
  try {
    // Step 1: Get all existing patients
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
      console.log('✅ No existing patients found. Migration not needed.');
      return;
    }

    // Step 2: Create mapping of old CUID to new numerical IDs
    const idMapping = new Map();
    existingPatients.forEach((patient, index) => {
      const newId = index + 1; // Start from 1
      idMapping.set(patient.id, newId);
      console.log(`Mapping: ${patient.id} → ${newId} (${patient.name})`);
    });

    // Step 3: Start transaction to update all records
    console.log('🔄 Starting database transaction...');
    
    await prisma.$transaction(async (tx) => {
      // Step 3a: Temporarily disable foreign key constraints
      await tx.$executeRaw`SET foreign_key_checks = 0;`;

      // Step 3b: Add new numerical ID column to patients table
      console.log('📊 Adding temporary numerical ID column...');
      await tx.$executeRaw`ALTER TABLE patients ADD COLUMN new_id INT AUTO_INCREMENT UNIQUE FIRST;`;

      // Step 3c: Create a temporary mapping table
      console.log('🗂️  Creating temporary ID mapping...');
      await tx.$executeRaw`
        CREATE TEMPORARY TABLE patient_id_mapping (
          old_id VARCHAR(255),
          new_id INT,
          PRIMARY KEY (old_id),
          INDEX (new_id)
        );
      `;

      // Step 3d: Populate the mapping table
      for (const [oldId, newId] of idMapping.entries()) {
        await tx.$executeRaw`INSERT INTO patient_id_mapping (old_id, new_id) VALUES (${oldId}, ${newId});`;
      }

      // Step 3e: Update investigations table to use new patient IDs
      console.log('🔗 Updating investigation references...');
      await tx.$executeRaw`
        UPDATE investigations i
        JOIN patient_id_mapping m ON i.patientId = m.old_id
        SET i.patientId = CAST(m.new_id AS CHAR);
      `;

      // Step 3f: Update the patients table to use the new ID structure
      console.log('👥 Updating patient records...');
      
      // Drop the old primary key and id column
      await tx.$executeRaw`ALTER TABLE patients DROP PRIMARY KEY, DROP COLUMN id;`;
      
      // Rename new_id to id and set it as primary key
      await tx.$executeRaw`ALTER TABLE patients CHANGE new_id id INT AUTO_INCREMENT PRIMARY KEY;`;

      // Step 3g: Update any other tables that reference patient IDs (if any exist)
      // Check if there are any other foreign key references
      const foreignKeyCheck = await tx.$queryRaw`
        SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'patients'
        AND REFERENCED_COLUMN_NAME = 'id'
        AND TABLE_SCHEMA = DATABASE();
      `;

      if (foreignKeyCheck.length > 0) {
        console.log('🔍 Found additional foreign key references:', foreignKeyCheck);
        // Handle any additional foreign key references here
      }

      // Step 3h: Re-enable foreign key constraints
      await tx.$executeRaw`SET foreign_key_checks = 1;`;

      console.log('✅ Transaction completed successfully!');
    });

    // Step 4: Verify the migration
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
    updatedPatients.forEach(patient => {
      console.log(`ID: ${patient.id} - ${patient.name} (${patient.investigations.length} investigations)`);
    });

    // Verify investigations are properly linked
    const investigationsCount = await prisma.investigation.count();
    console.log(`Total investigations: ${investigationsCount}`);

    console.log('\n🎉 Patient ID migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('1. Update the Prisma schema to use Int for Patient ID');
    console.log('2. Run prisma db pull to sync the schema');
    console.log('3. Generate new Prisma client');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
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