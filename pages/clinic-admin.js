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
import { FiMapPin, FiUsers } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { UserManagement, BranchManagement } from '@/components/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { useAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// Clinic Admin Dashboard - Only manages Branch Admins
export default function ClinicAdminDashboard({ initialStats }) {
  const [stats] = useState(initialStats || {
    branchesCount: 0,
    branchAdminsCount: 0,
  });
  
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Clinic Admin only manages branches and branch admins
  const isClinicAdmin = user?.role === 'clinicadmin';
  
  return (
    <MainLayout>
      <Box p={4}>
        <Heading size="lg" mb={6}>Clinic Administration Dashboard</Heading>
        <Text mb={6} color={useColorModeValue('gray.600', 'gray.300')}>
          Welcome {user?.name}, manage your clinic branches and branch administrators
        </Text>
        
        {/* Stats Overview - Clinic Admin only sees Branch-related stats */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiMapPin} boxSize={8} mr={4} color="green.500" />
                <Box>
                  <StatLabel>Total Branches</StatLabel>
                  <StatNumber>{stats.branchesCount}</StatNumber>
                  <StatHelpText>Branches in your clinic</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiUsers} boxSize={8} mr={4} color="purple.500" />
                <Box>
                  <StatLabel>Branch Admins</StatLabel>
                  <StatNumber>{stats.branchAdminsCount}</StatNumber>
                  <StatHelpText>Branch administrators</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
        </SimpleGrid>
        
        <Tabs variant="enclosed" colorScheme="blue" isLazy>
          <TabList>
            {isClinicAdmin && <Tab>Branches</Tab>}
            {isClinicAdmin && <Tab>Branch Admins</Tab>}
          </TabList>
          
          <TabPanels>
            {/* Branch Management Tab - Clinic Admin only */}
            {isClinicAdmin && (
              <TabPanel>
                <BranchManagement />
              </TabPanel>
            )}
            
            {/* Branch Admin Management Tab - Clinic Admin only */}
            {isClinicAdmin && (
              <TabPanel>
                <UserManagement 
                  restrictedRole="branchadmin" 
                  title="Branch Admin Management"
                  description="Manage branch administrators for your clinic"
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
  
  // Only allow clinic admins
  if (session.user.role !== 'clinicadmin') {
    return {
      redirect: {
        destination: session.user.role === 'superadmin' ? '/saas-admin' : 
                   session.user.role === 'branchadmin' ? '/branch-admin' : '/doctor-dashboard',
        permanent: false,
      },
    };
  }
  
  // Fetch dashboard stats for clinic admin
  const prisma = new PrismaClient();
  let stats = {
    branchesCount: 0,
    branchAdminsCount: 0,
  };
  
  try {
    // Get branches count for this clinic
    const branchesCount = await prisma.branch.count({
      where: {
        clinicId: session.user.clinicId,
        isActive: true,
      },
    });
    
    // Get branch admins count for this clinic
    const branchAdminsCount = await prisma.user.count({
      where: {
        clinicId: session.user.clinicId,
        role: 'branchadmin',
        isActive: true,
      },
    });
    
    stats = {
      branchesCount,
      branchAdminsCount,
    };
  } catch (error) {
    console.error('Error fetching clinic admin stats:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  return {
    props: {
      initialStats: stats,
    },
  };
}
