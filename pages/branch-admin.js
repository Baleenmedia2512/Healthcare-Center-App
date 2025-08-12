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
import { FiUsers, FiUserCheck } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { UserManagement } from '@/components/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { useAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// Branch Admin Dashboard - Only manages Doctors
export default function BranchAdminDashboard({ initialStats }) {
  const [stats] = useState(initialStats || {
    doctorsCount: 0,
    activeDoctorsCount: 0,
  });
  
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Branch Admin only manages doctors
  const isBranchAdmin = user?.role === 'branchadmin';
  
  return (
    <MainLayout>
      <Box p={4}>
        <Heading size="lg" mb={6}>Branch Administration Dashboard</Heading>
        <Text mb={6} color={useColorModeValue('gray.600', 'gray.300')}>
          Welcome {user?.name}, manage doctors in your branch: {user?.branchName}
        </Text>
        
        {/* Stats Overview - Branch Admin only sees Doctor-related stats */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiUsers} boxSize={8} mr={4} color="blue.500" />
                <Box>
                  <StatLabel>Total Doctors</StatLabel>
                  <StatNumber>{stats.doctorsCount}</StatNumber>
                  <StatHelpText>Doctors in your branch</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiUserCheck} boxSize={8} mr={4} color="green.500" />
                <Box>
                  <StatLabel>Active Doctors</StatLabel>
                  <StatNumber>{stats.activeDoctorsCount}</StatNumber>
                  <StatHelpText>Currently active doctors</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
        </SimpleGrid>
        
        <Tabs variant="enclosed" colorScheme="blue" isLazy>
          <TabList>
            {isBranchAdmin && <Tab>Doctor Management</Tab>}
          </TabList>
          
          <TabPanels>
            {/* Doctor Management Tab - Branch Admin only */}
            {isBranchAdmin && (
              <TabPanel>
                <UserManagement 
                  restrictedRole="doctor" 
                  title="Doctor Management"
                  description="Manage doctors in your branch"
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
  
  // Only allow branch admins
  if (session.user.role !== 'branchadmin') {
    return {
      redirect: {
        destination: session.user.role === 'superadmin' ? '/saas-admin' : 
                   session.user.role === 'clinicadmin' ? '/clinic-admin' : '/doctor-dashboard',
        permanent: false,
      },
    };
  }
  
  // Fetch dashboard stats for branch admin
  const prisma = new PrismaClient();
  let stats = {
    doctorsCount: 0,
    activeDoctorsCount: 0,
  };
  
  try {
    // Get doctors count for this branch
    const doctorsCount = await prisma.user.count({
      where: {
        branchId: session.user.branchId,
        role: 'doctor',
      },
    });
    
    // Get active doctors count for this branch
    const activeDoctorsCount = await prisma.user.count({
      where: {
        branchId: session.user.branchId,
        role: 'doctor',
        isActive: true,
      },
    });
    
    stats = {
      doctorsCount,
      activeDoctorsCount,
    };
  } catch (error) {
    console.error('Error fetching branch admin stats:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  return {
    props: {
      initialStats: stats,
    },
  };
}
