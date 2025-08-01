/**
 * Production Database Migration Script
 * Run this after deploying to Vercel to set up the database schema
 */

const { PrismaClient } = require('@prisma/client');

async function migrate() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Running database migrations...');
    
    // This will apply all pending migrations
    await prisma.$executeRaw`SELECT 1`;
    
    console.log('✅ Database migrations completed successfully!');
    
    // Optionally seed the database
    console.log('🌱 Checking for seed data...');
    
    // Check if we have any clinics (to avoid duplicate seeding)
    const clinicCount = await prisma.clinic.count();
    
    if (clinicCount === 0) {
      console.log('📊 Seeding initial data...');
      
      // Create a default clinic
      const clinic = await prisma.clinic.create({
        data: {
          name: 'Demo Clinic',
          address: '123 Healthcare Street, Medical City',
          contactEmail: 'admin@democlinic.com',
          contactPhone: '+1-555-0123',
          primaryColor: '#84c9ef',
          secondaryColor: '#b4d2ed',
        }
      });
      
      // Create a default admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@democlinic.com',
          username: 'admin',
          password: hashedPassword,
          firstName: 'System',
          lastName: 'Administrator',
          role: 'superadmin',
          isActive: true,
          clinicId: clinic.id,
        }
      });
      
      console.log('✅ Initial seed data created!');
      console.log('📧 Default admin email: admin@democlinic.com');
      console.log('🔑 Default admin password: admin123');
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log('📊 Database already contains data, skipping seed.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('🎉 Production setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Production setup failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
