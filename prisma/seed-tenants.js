/**
 * Multi-tenant seed script for the Healthcare Center SaaS app
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting SaaS multi-tenant seed script...');

  // Create a superadmin user
  const superadminPassword = await bcrypt.hash('superadmin123', 10);
  
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@healthcare.com' },
    update: {
      hashedPassword: superadminPassword,
      role: 'superadmin'
    },
    create: {
      email: 'superadmin@healthcare.com',
      fullName: 'Super Administrator',
      hashedPassword: superadminPassword,
      role: 'superadmin'
    }
  });
  
  console.log(`Created superadmin user: ${superadmin.id}`);
  
  // Create a sample clinic
  const clinic1 = await prisma.clinic.create({
    data: {
      name: 'Main Healthcare Center',
      address: '123 Main Street, City',
      contactEmail: 'contact@healthcare.com',
      contactPhone: '123-456-7890'
    }
  });
  
  console.log(`Created clinic: ${clinic1.name} (${clinic1.id})`);
  
  // Create a branch for the clinic
  const branch1 = await prisma.branch.create({
    data: {
      name: 'Downtown Branch',
      address: '456 Downtown Avenue, City',
      contactEmail: 'downtown@healthcare.com',
      contactPhone: '123-456-7891',
      clinicId: clinic1.id
    }
  });
  
  console.log(`Created branch: ${branch1.name} (${branch1.id})`);
  
  // Create a second branch
  const branch2 = await prisma.branch.create({
    data: {
      name: 'Uptown Branch',
      address: '789 Uptown Boulevard, City',
      contactEmail: 'uptown@healthcare.com',
      contactPhone: '123-456-7892',
      clinicId: clinic1.id
    }
  });
  
  console.log(`Created branch: ${branch2.name} (${branch2.id})`);
  
  // Create a clinic admin
  const clinicAdminPassword = await bcrypt.hash('clinic123', 10);
  
  const clinicAdmin = await prisma.user.create({
    data: {
      email: 'clinicadmin@healthcare.com',
      fullName: 'Clinic Administrator',
      hashedPassword: clinicAdminPassword,
      role: 'clinicadmin',
      clinicId: clinic1.id
    }
  });
  
  console.log(`Created clinic admin: ${clinicAdmin.id}`);
  
  // Create a branch admin for first branch
  const branchAdminPassword = await bcrypt.hash('branch123', 10);
  
  const branchAdmin = await prisma.user.create({
    data: {
      email: 'branchadmin@healthcare.com',
      fullName: 'Branch Administrator',
      hashedPassword: branchAdminPassword,
      role: 'branchadmin',
      clinicId: clinic1.id,
      branchId: branch1.id
    }
  });
  
  console.log(`Created branch admin: ${branchAdmin.id}`);
  
  // Create a doctor for first branch
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  
  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@healthcare.com',
      fullName: 'Dr. John Smith',
      hashedPassword: doctorPassword,
      role: 'doctor',
      clinicId: clinic1.id,
      branchId: branch1.id
    }
  });
  
  console.log(`Created doctor: ${doctor.id}`);
  
  // Update existing patients to be associated with the first branch
  // This is for existing data migration
  try {
    console.log('Updating existing patients with branch association...');
    const updatedPatients = await prisma.patient.updateMany({
      where: {
        OR: [
          { branchId: '' },
          { branchId: null }
        ]
      },
      data: {
        branchId: branch1.id
      }
    });
    
    console.log(`Updated ${updatedPatients.count} existing patients with branch association`);
  } catch (error) {
    console.warn('No patients to update or patient table not yet available:', error.message);
  }
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
