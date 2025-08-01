const { PrismaClient } = require('@prisma/client');

// Database integrity checker and auto-fixer
class DatabaseIntegrityChecker {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async checkAndFixJsonIntegrity() {
    try {
      console.log('🔍 Starting database integrity check...');
      
      const patients = await this.prisma.patient.findMany({
        select: {
          id: true,
          name: true,
          medicalHistory: true,
          physicalGenerals: true,
          menstrualHistory: true,
          foodAndHabit: true,
          updatedAt: true
        }
      });

      let corruptedFields = 0;
      let fixedFields = 0;
      const corruptedPatients = [];

      const jsonFields = ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'];

      for (const patient of patients) {
        const updates = {};
        let patientCorrupted = false;

        for (const field of jsonFields) {
          if (patient[field]) {
            try {
              // Test if JSON is valid
              JSON.parse(patient[field]);
            } catch (e) {
              console.log(`❌ Corruption found: ${patient.name} - ${field}`);
              console.log(`   Error: ${e.message}`);
              
              corruptedFields++;
              patientCorrupted = true;
              
              // Auto-fix by setting to null
              updates[field] = null;
              fixedFields++;
            }
          }
        }

        if (patientCorrupted) {
          corruptedPatients.push({
            id: patient.id,
            name: patient.name,
            corrupted_fields: Object.keys(updates)
          });

          // Apply fixes
          await this.prisma.patient.update({
            where: { id: patient.id },
            data: updates
          });
          
          console.log(`🔧 Auto-fixed ${patient.name}`);
        }
      }

      // Generate integrity report
      const report = {
        timestamp: new Date().toISOString(),
        total_patients: patients.length,
        corrupted_fields: corruptedFields,
        fixed_fields: fixedFields,
        corrupted_patients: corruptedPatients,
        status: corruptedFields === 0 ? 'CLEAN' : 'FIXED'
      };

      console.log('\n📊 INTEGRITY REPORT');
      console.log('==================');
      console.log(`Total patients: ${report.total_patients}`);
      console.log(`Corrupted fields found: ${report.corrupted_fields}`);
      console.log(`Fields auto-fixed: ${report.fixed_fields}`);
      console.log(`Database status: ${report.status}`);

      if (corruptedPatients.length > 0) {
        console.log('\n⚠️  Affected patients:');
        corruptedPatients.forEach(p => {
          console.log(`   - ${p.name} (${p.id}): ${p.corrupted_fields.join(', ')}`);
        });
      }

      return report;
    } catch (error) {
      console.error('❌ Integrity check failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async schedulePeriodicChecks() {
    console.log('⏰ Starting periodic integrity checks (every 5 minutes)...');
    
    setInterval(async () => {
      try {
        const report = await this.checkAndFixJsonIntegrity();
        if (report.corrupted_fields > 0) {
          console.log(`🚨 ALERT: Found and fixed ${report.corrupted_fields} corrupted fields`);
        }
      } catch (error) {
        console.error('⚠️  Periodic check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

module.exports = DatabaseIntegrityChecker;

// If run directly
if (require.main === module) {
  const checker = new DatabaseIntegrityChecker();
  checker.checkAndFixJsonIntegrity()
    .then(report => {
      console.log('\n✅ Integrity check completed');
      process.exit(report.corrupted_fields > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}
