const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@healthcare.com' },
    update: {},
    create: {
      email: 'admin@healthcare.com',
      hashedPassword: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
      isActive: true,
    },
  });

  // Create doctor user
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@healthcare.com' },
    update: {},
    create: {
      email: 'doctor@healthcare.com',
      hashedPassword: doctorPassword,
      fullName: 'Dr. John Doe',
      role: 'doctor',
      isActive: true,
    },
  });

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
    }
  });

  console.log('✅ Sample patient created:', { id: samplePatient.id, name: samplePatient.name });
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
