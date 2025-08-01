#!/usr/bin/env node
/**
 * Database Health Check Script
 * Verifies all database connections and configurations are working correctly
 */

const { PrismaClient } = require('@prisma/client');

async function checkDatabaseHealth() {
  console.log('🔍 Database Health Check');
  console.log('='.repeat(50));

  const prisma = new PrismaClient();
  let errors = [];
  let warnings = [];

  try {
    // 1. Test basic connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful');

    // 2. Check database provider
    console.log('2️⃣ Checking database provider...');
    const dbInfo = await prisma.$queryRaw`SELECT @@version as version, @@hostname as hostname`;
    console.log('   ✅ Database provider: MySQL/MariaDB');
    console.log(`   📋 Version: ${dbInfo[0].version}`);
    console.log(`   🏠 Hostname: ${dbInfo[0].hostname}`);

    // 3. Test table existence and basic queries
    console.log('3️⃣ Testing table structure...');
    
    const tables = [
      { name: 'Clinic', model: 'clinic' },
      { name: 'Branch', model: 'branch' },
      { name: 'User', model: 'user' },
      { name: 'Patient', model: 'patient' },
      { name: 'Investigation', model: 'investigation' }
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table.model].count();
        console.log(`   ✅ ${table.name} table: ${count} records`);
      } catch (error) {
        errors.push(`❌ ${table.name} table error: ${error.message}`);
      }
    }

    // 4. Test authentication data
    console.log('4️⃣ Testing authentication data...');
    const adminUsers = await prisma.user.count({
      where: { role: 'superadmin' }
    });
    const doctorUsers = await prisma.user.count({
      where: { role: 'doctor' }
    });
    console.log(`   ✅ Admin users: ${adminUsers}`);
    console.log(`   ✅ Doctor users: ${doctorUsers}`);

    // 5. Test JSON field parsing
    console.log('5️⃣ Testing JSON field integrity...');
    const patientsWithJsonFields = await prisma.patient.findMany({
      where: {
        OR: [
          { medicalHistory: { not: null } },
          { physicalGenerals: { not: null } },
          { menstrualHistory: { not: null } },
          { foodAndHabit: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        medicalHistory: true,
        physicalGenerals: true,
        menstrualHistory: true,
        foodAndHabit: true
      }
    });

    let jsonErrors = 0;
    for (const patient of patientsWithJsonFields) {
      const jsonFields = ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'];
      for (const field of jsonFields) {
        if (patient[field]) {
          try {
            JSON.parse(patient[field]);
          } catch (e) {
            jsonErrors++;
            errors.push(`❌ Patient ${patient.name} has corrupted ${field}: ${e.message}`);
          }
        }
      }
    }

    if (jsonErrors === 0) {
      console.log('   ✅ All JSON fields are valid');
    }

    // 6. Test environment configuration
    console.log('6️⃣ Checking environment configuration...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL', 
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_API_URL'
    ];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: configured`);
      } else {
        errors.push(`❌ Missing environment variable: ${envVar}`);
      }
    }

    // Check DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      if (dbUrl.startsWith('mysql://')) {
        console.log('   ✅ DATABASE_URL format: MySQL');
      } else if (dbUrl.startsWith('file:')) {
        warnings.push(`⚠️ DATABASE_URL still using SQLite - should be MySQL for production`);
      } else {
        warnings.push(`⚠️ DATABASE_URL format not recognized: ${dbUrl.substring(0, 20)}...`);
      }
    }

  } catch (error) {
    errors.push(`❌ Database connection failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }

  // 7. Summary
  console.log('7️⃣ Health Check Summary');
  console.log('='.repeat(30));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 All checks passed! Database is healthy.');
  } else {
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Errors found:');
      errors.forEach(error => console.log(`   ${error}`));
      process.exit(1);
    }
  }

  console.log('\n✅ Database health check completed');
}

// Run the health check
checkDatabaseHealth().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
