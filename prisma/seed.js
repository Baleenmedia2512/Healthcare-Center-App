const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: 'demo-clinic-id' },
    update: {},
    create: {
      id: 'demo-clinic-id',
      name: 'Demo Healthcare Center',
      address: '123 Healthcare Street, Medical City, MC 12345',
      contactEmail: 'admin@democlinic.com',
      contactPhone: '+1-555-0123',
      primaryColor: '#84c9ef',
      secondaryColor: '#b4d2ed',
      isActive: true,
    },
  });

  // Create a demo branch
  const branch = await prisma.branch.upsert({
    where: { id: 'demo-branch-id' },
    update: {},
    create: {
      id: 'demo-branch-id',
      name: 'Main Branch',
      address: '123 Healthcare Street, Medical City, MC 12345',
      contactEmail: 'branch@democlinic.com',
      contactPhone: '+1-555-0124',
      clinicId: clinic.id,
      isActive: true,
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@democlinic.com' },
    update: {},
    create: {
      email: 'admin@democlinic.com',
      hashedPassword: adminPassword,
      fullName: 'System Administrator',
      role: 'superadmin',
      isActive: true,
      clinicId: clinic.id,
    },
  });

  // Create doctor user
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@democlinic.com' },
    update: {
      branchId: branch.id,
      clinicId: clinic.id,
    },
    create: {
      email: 'doctor@democlinic.com',
      hashedPassword: doctorPassword,
      fullName: 'Dr. John Doe',
      role: 'doctor',
      isActive: true,
      clinicId: clinic.id,
      branchId: branch.id,
    },
  });

  console.log('✅ Clinic created:', { id: clinic.id, name: clinic.name });
  console.log('✅ Branch created:', { id: branch.id, name: branch.name });
  console.log('✅ Admin user created:', { id: admin.id, email: admin.email });
  console.log('✅ Doctor user created:', { id: doctor.id, email: doctor.email });

  // Create sample patient for demo
  const samplePatient = await prisma.patient.create({
    data: {
      name: 'John Smith',
      guardianName: 'Jane Smith',
      address: '123 Main Street, City, State 12345',
      age: 35,
      sex: 'Male',
      occupation: 'Software Engineer',
      mobileNumber: '+1234567890',
      chiefComplaints: 'Regular checkup and general consultation',
      userId: doctor.id,
      branchId: branch.id,
      medicalHistory: JSON.stringify({
        pastHistory: {
          allergy: false,
          anemia: false,
          arthritis: false,
          asthma: false,
          cancer: false,
          diabetes: false,
          heartDisease: false,
          hypertension: false,
          thyroid: false,
          tuberculosis: false,
        },
        familyHistory: {
          diabetes: true,
          hypertension: false,
          thyroid: false,
          tuberculosis: false,
          cancer: false,
        }
      }),
      physicalGenerals: JSON.stringify({
        appetite: 'Normal',
        bowel: 'Regular',
        urine: 'Normal',
        sweating: 'Normal',
        sleep: '7-8 hours',
        thirst: 'Normal',
        addictions: 'None',
      }),
      foodAndHabit: JSON.stringify({
        foodHabit: 'Non-vegetarian',
        addictions: 'Occasional coffee',
      })
    }
  });

  // Create sample investigation
  await prisma.investigation.create({
    data: {
      type: 'Blood Test',
      details: 'Complete Blood Count (CBC) - All parameters within normal range',
      date: new Date(),
      patientId: samplePatient.id,
      doctor: 'Dr. John Doe',
      results: 'All values within normal limits',
      normalRange: 'Refer to lab standards',
    }
  });

  console.log('✅ Sample patient created:', { id: samplePatient.id, name: samplePatient.name });
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Admin: admin@democlinic.com / admin123');
  console.log('   Doctor: doctor@democlinic.com / doctor123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
