import React, { useState } from 'react';
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Heading,
  Text,
  Flex,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FiUsers, FiHospital, FiMapPin, FiSettings } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { UserManagement, ClinicManagement, BranchManagement, BrandingManagement } from '@/components/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { useAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// SaaS Admin Dashboard - Only manages Clinic Admins
export default function SaasAdminDashboard({ initialStats }) {
  const [stats] = useState(initialStats || {
    clinicsCount: 0,
    clinicAdminsCount: 0,
  });
  
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // SaaS Admin only manages clinics and clinic admins
  const showClinicTab = user?.role === 'superadmin';
  
  return (
    <MainLayout>
      <Box p={4}>
        <Heading size="lg" mb={6}>SaaS Administration Dashboard</Heading>
        
        {/* Stats Overview - SaaS Admin only sees Clinic-related stats */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiHospital} boxSize={8} mr={4} color="blue.500" />
                <Box>
                  <StatLabel>Total Clinics</StatLabel>
                  <StatNumber>{stats.clinicsCount}</StatNumber>
                  <StatHelpText>Active clinics on the platform</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiUsers} boxSize={8} mr={4} color="purple.500" />
                <Box>
                  <StatLabel>Clinic Admins</StatLabel>
                  <StatNumber>{stats.clinicAdminsCount}</StatNumber>
                  <StatHelpText>Clinic administrators</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
        </SimpleGrid>
        
        <Tabs variant="enclosed" colorScheme="blue" isLazy>
          <TabList>
            {showClinicTab && <Tab>Clinics</Tab>}
            {showClinicTab && <Tab>Clinic Admins</Tab>}
          </TabList>
          
          <TabPanels>
            {/* Clinic Management Tab - SaaS Admin only */}
            {showClinicTab && (
              <TabPanel>
                <ClinicManagement />
              </TabPanel>
            )}
            
            {/* Clinic Admin Management Tab - SaaS Admin only */}
            {showClinicTab && (
              <TabPanel>
                <UserManagement 
                  restrictedRole="clinicadmin" 
                  title="Clinic Admin Management"
                  description="Manage clinic administrators for your platform"
                />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Redirect if not logged in
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  // Only allow superadmins for SaaS admin dashboard
  if (session.user.role !== 'superadmin') {
    return {
      redirect: {
        destination: session.user.role === 'clinicadmin' ? '/clinic-admin' : 
                   session.user.role === 'branchadmin' ? '/branch-admin' : '/doctor-dashboard',
        permanent: false,
      },
    };
  }
  
  // Fetch dashboard stats for SaaS admin
  const prisma = new PrismaClient();
  let stats = {
    clinicsCount: 0,
    clinicAdminsCount: 0,
  };
  
  try {
    // Get all clinics count
    stats.clinicsCount = await prisma.clinic.count({ where: { isActive: true } });
    
    // Get clinic admins count
    stats.clinicAdminsCount = await prisma.user.count({
      where: { 
        role: 'clinicadmin',
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error fetching SaaS admin stats:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  return {
    props: {
      initialStats: stats,
    },
  };
}
