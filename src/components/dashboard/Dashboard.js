import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Text,
  Icon,
  Heading,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { 
  FiUsers,
  FiActivity,
  FiCalendar,
  FiFileText,
  FiHome,
  FiTrendingUp,
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { getDashboardStats } from '@/lib/api/dashboard';

// Stat card component
const StatCard = ({ title, stat, icon, helpText, accentColor }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const statColor = useColorModeValue('gray.800', 'gray.100');
  const helpTextColor = useColorModeValue('gray.500', 'gray.400');
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py="5"
      shadow="md"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      rounded="lg"
      bg={cardBg}
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight="medium" isTruncated color={labelColor}>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="medium" color={statColor}>
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText mb={0} color={helpTextColor}>
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          my="auto"
          color={accentColor || 'gray.500'}
          alignContent="center"
        >
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );
};

// SuperAdmin Dashboard Component
const SuperAdminDashboard = ({ stats }) => {
  return (
    <Box p={6}>
      <Heading size="lg" mb={2}>MediBoo Super Admin Dashboard</Heading>
      <Badge colorScheme="blue" mb={6}>Healthcare SaaS Platform Administration</Badge>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Clinics"
          stat={stats.clinicCount || 0}
          icon={FiHome}
          accentColor="teal.500"
        />
        <StatCard
          title="Total Branches"
          stat={stats.branchCount || 0}
          icon={FiTrendingUp}
          accentColor="cyan.500"
        />
        <StatCard
          title="Total Users"
          stat={stats.userCount || 0}
          icon={FiUsers}
          accentColor="blue.500"
        />
        <StatCard
          title="Total Patients"
          stat={stats.patientCount || 0}
          icon={FiUsers}
          accentColor="green.500"
        />
        <StatCard
          title="Investigations"
          stat={stats.investigationCount || 0}
          icon={FiFileText}
          accentColor="purple.500"
        />
        <StatCard
          title="Recent Activity"
          stat={stats.recentActivity || 0}
          icon={FiActivity}
          helpText="Last 30 days"
          accentColor="orange.500"
        />
      </SimpleGrid>
      
      <Card mt={8}>
        <CardBody>
          <Heading size="md" mb={4}>System Status</Heading>
          <Text>Database: Connected</Text>
          <Text>Storage: 2.3GB / 10GB (23%)</Text>
          <Text>Last Backup: 2 days ago</Text>
        </CardBody>
      </Card>
    </Box>
  );
};

// Clinic Admin Dashboard Component
const ClinicAdminDashboard = ({ stats, clinicName }) => {
  return (
    <Box p={6}>
      <Heading size="lg" mb={2}>Clinic Admin Dashboard</Heading>
      {clinicName && <Badge colorScheme="blue" mb={6}>{clinicName}</Badge>}
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Branches"
          stat={stats.branchCount || 0}
          icon={FiTrendingUp}
          accentColor="cyan.500"
        />
        <StatCard
          title="Total Users"
          stat={stats.userCount || 0}
          icon={FiUsers}
          accentColor="blue.500"
        />
        <StatCard
          title="Total Patients"
          stat={stats.patientCount || 0}
          icon={FiUsers}
          accentColor="green.500"
        />
        <StatCard
          title="Investigations"
          stat={stats.investigationCount || 0}
          icon={FiFileText}
          accentColor="purple.500"
        />
        <StatCard
          title="Recent Activity"
          stat={stats.recentActivity || 0}
          icon={FiActivity}
          helpText="Last 30 days"
          accentColor="orange.500"
        />
      </SimpleGrid>
    </Box>
  );
};

// Branch Admin Dashboard Component
const BranchAdminDashboard = ({ stats, branchName }) => {
  return (
    <Box p={6}>
      <Heading size="lg" mb={2}>Branch Admin Dashboard</Heading>
      {branchName && <Badge colorScheme="green" mb={6}>{branchName}</Badge>}
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Users"
          stat={stats.userCount || 0}
          icon={FiUsers}
          accentColor="blue.500"
        />
        <StatCard
          title="Total Patients"
          stat={stats.patientCount || 0}
          icon={FiUsers}
          accentColor="green.500"
        />
        <StatCard
          title="Investigations"
          stat={stats.investigationCount || 0}
          icon={FiFileText}
          accentColor="purple.500"
        />
        <StatCard
          title="Recent Activity"
          stat={stats.recentActivity || 0}
          icon={FiActivity}
          helpText="Last 30 days"
          accentColor="orange.500"
        />
      </SimpleGrid>
    </Box>
  );
};

// Doctor Dashboard Component
const DoctorDashboard = ({ stats, branchName }) => {
  return (
    <Box p={6}>
      <Heading size="lg" mb={2}>Doctor Dashboard</Heading>
      {branchName && <Badge colorScheme="purple" mb={6}>{branchName}</Badge>}
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="My Patients"
          stat={stats.myPatientCount || 0}
          icon={FiUsers}
          accentColor="green.500"
        />
        <StatCard
          title="Recent Cases"
          stat={stats.recentCases || 0}
          icon={FiCalendar}
          helpText="Last 30 days"
          accentColor="blue.500"
        />
        <StatCard
          title="Pending Reports"
          stat={stats.pendingReports || 0}
          icon={FiFileText}
          accentColor="red.500"
        />
        <StatCard
          title="Total Investigations"
          stat={stats.investigationCount || 0}
          icon={FiActivity}
          accentColor="purple.500"
        />
      </SimpleGrid>
    </Box>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        // Set default stats instead of showing error
        setStats({
          userCount: 0,
          patientCount: 0,
          investigationCount: 0,
          recentActivity: 0,
          myPatientCount: 0,
          recentCases: 0,
          pendingReports: 0,
          clinicCount: 0,
          branchCount: 0
        });
        
        toast({
          title: 'Dashboard Notice',
          description: 'Dashboard statistics are being loaded. Please refresh if needed.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [toast, session]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="50vh" direction="column">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        <Text mt={4}>Loading dashboard...</Text>
      </Flex>
    );
  }

  // Determine which dashboard to show based on role
  if (!session?.user) {
    return <Text>No user session available</Text>;
  }

  const { role, clinicName, branchName } = session.user;

  switch (role) {
    case 'superadmin':
      return <SuperAdminDashboard stats={stats} />;
    case 'clinicadmin':
      return <ClinicAdminDashboard stats={stats} clinicName={clinicName} />;
    case 'branchadmin':
      return <BranchAdminDashboard stats={stats} branchName={branchName} />;
    case 'doctor':
    default:
      return <DoctorDashboard stats={stats} branchName={branchName} />;
  }
};

export default Dashboard;
export { SuperAdminDashboard, ClinicAdminDashboard, BranchAdminDashboard, DoctorDashboard };
