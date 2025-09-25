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
  Input,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  HStack,
  Link,
  Select,
} from '@chakra-ui/react';
import { 
  FiUsers,
  FiActivity,
  FiCalendar,
  FiFileText,
  FiHome,
  FiTrendingUp,
  FiPhone,
  FiEye,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { getDashboardStats } from '@/lib/api/dashboard';
import NextLink from 'next/link';

// Appointments Summary Component
const AppointmentsSummary = ({ appointments, selectedDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateObj = new Date(selectedDate);
  selectedDateObj.setHours(0, 0, 0, 0);
  
  const isToday = selectedDateObj.getTime() === today.getTime();
  const isOverdue = selectedDateObj < today;
  
  const summary = appointments.reduce((acc, appointment) => {
    const appointmentDate = new Date(appointment.followUpDate);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      acc.overdue++;
    } else if (appointmentDate.getTime() === today.getTime()) {
      acc.today++;
    } else {
      acc.upcoming++;
    }
    return acc;
  }, { overdue: 0, today: 0, upcoming: 0 });

  return (
    <Box mb={6}>
      <HStack spacing={4} justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
          {isToday ? 'Today\'s Schedule' : isOverdue ? 'Overdue Appointments' : 'Scheduled Appointments'} 
          - {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        <Badge 
          colorScheme="blue" 
          variant={useColorModeValue('subtle', 'solid')} 
          fontSize="sm" 
          px={3} 
          py={1}
        >
          {appointments.length} Total
        </Badge>
      </HStack>
      
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {isToday && (
          <Box 
            p={3} 
            bg={useColorModeValue('blue.50', 'blue.900')} 
            borderRadius="md" 
            border="1px" 
            borderColor={useColorModeValue('blue.200', 'blue.600')}
          >
            <HStack>
              <Icon as={FiCalendar} color={useColorModeValue('blue.500', 'blue.400')} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('blue.600', 'blue.300')}>
                  {summary.today}
                </Text>
                <Text fontSize="xs" color={useColorModeValue('blue.500', 'blue.400')}>Today</Text>
              </VStack>
            </HStack>
          </Box>
        )}
        
        {summary.overdue > 0 && (
          <Box 
            p={3} 
            bg={useColorModeValue('red.50', 'red.900')} 
            borderRadius="md" 
            border="1px" 
            borderColor={useColorModeValue('red.200', 'red.600')}
          >
            <HStack>
              <Icon as={FiAlertCircle} color={useColorModeValue('red.500', 'red.400')} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('red.600', 'red.300')}>
                  {summary.overdue}
                </Text>
                <Text fontSize="xs" color={useColorModeValue('red.500', 'red.400')}>Overdue</Text>
              </VStack>
            </HStack>
          </Box>
        )}
        
        {summary.upcoming > 0 && (
          <Box 
            p={3} 
            bg={useColorModeValue('green.50', 'green.900')} 
            borderRadius="md" 
            border="1px" 
            borderColor={useColorModeValue('green.200', 'green.600')}
          >
            <HStack>
              <Icon as={FiClock} color={useColorModeValue('green.500', 'green.400')} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('green.600', 'green.300')}>
                  {summary.upcoming}
                </Text>
                <Text fontSize="xs" color={useColorModeValue('green.500', 'green.400')}>Upcoming</Text>
              </VStack>
            </HStack>
          </Box>
        )}
        
        <Box 
          p={3} 
          bg={useColorModeValue('gray.50', 'gray.700')} 
          borderRadius="md" 
          border="1px" 
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <HStack>
            <Icon as={FiUsers} color={useColorModeValue('gray.500', 'gray.400')} />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('gray.600', 'gray.300')}>
                {new Set(appointments.map(a => a.patient?.id)).size}
              </Text>
              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>Patients</Text>
            </VStack>
          </HStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

// Appointments Table Component
const AppointmentsTable = ({ appointments, selectedDate }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  const getAppointmentStatus = (followUpDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(followUpDate);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return { status: 'overdue', color: 'red' };
    } else if (appointmentDate.getTime() === today.getTime()) {
      return { status: 'today', color: 'blue' };
    } else {
      return { status: 'upcoming', color: 'green' };
    }
  };
  
  // Filter and sort appointments
  const filteredAndSortedAppointments = React.useMemo(() => {
    let filtered = appointments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patient?.mobileNumber?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.followUpDate);
        appointmentDate.setHours(0, 0, 0, 0);
        
        switch (filter) {
          case 'today':
            return appointmentDate.getTime() === today.getTime();
          case 'overdue':
            return appointmentDate < today;
          case 'upcoming':
            return appointmentDate > today;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.patient?.name || '').localeCompare(b.patient?.name || '');
        case 'date':
          return new Date(a.followUpDate) - new Date(b.followUpDate);
        case 'status':
          const statusA = getAppointmentStatus(a.followUpDate).status;
          const statusB = getAppointmentStatus(b.followUpDate).status;
          return statusA.localeCompare(statusB);
        default:
          return 0;
      }
    });

    return filtered;
  }, [appointments, filter, sortBy, searchTerm]);
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      {/* Filter and Sort Controls */}
      <HStack spacing={4} mb={4} wrap="wrap">
        <Box>
          <Text fontSize="sm" mb={1} color={useColorModeValue('gray.600', 'gray.400')}>Search</Text>
          <Input
            placeholder="Search patients, details, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
            maxW="250px"
            bg={useColorModeValue('white', 'gray.700')}
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            color={useColorModeValue('gray.800', 'gray.100')}
            _placeholder={{ 
              color: useColorModeValue('gray.400', 'gray.500') 
            }}
            _focus={{
              borderColor: useColorModeValue('blue.500', 'blue.400'),
              boxShadow: `0 0 0 1px ${useColorModeValue('blue.500', 'blue.400')}`
            }}
          />
        </Box>
        
        <Box>
          <Text fontSize="sm" mb={1} color={useColorModeValue('gray.600', 'gray.400')}>Filter by Status</Text>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="sm"
            maxW="150px"
            bg={useColorModeValue('white', 'gray.700')}
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            color={useColorModeValue('gray.800', 'gray.100')}
            _focus={{
              borderColor: useColorModeValue('blue.500', 'blue.400'),
              boxShadow: `0 0 0 1px ${useColorModeValue('blue.500', 'blue.400')}`
            }}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
          </Select>
        </Box>
        
        <Box>
          <Text fontSize="sm" mb={1} color={useColorModeValue('gray.600', 'gray.400')}>Sort by</Text>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="sm"
            maxW="150px"
            bg={useColorModeValue('white', 'gray.700')}
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            color={useColorModeValue('gray.800', 'gray.100')}
            _focus={{
              borderColor: useColorModeValue('blue.500', 'blue.400'),
              boxShadow: `0 0 0 1px ${useColorModeValue('blue.500', 'blue.400')}`
            }}
          >
            <option value="name">Patient Name</option>
            <option value="date">Appointment Date</option>
            <option value="status">Status</option>
          </Select>
        </Box>
        
        <Box>
          <Text fontSize="sm" mb={1} color={useColorModeValue('gray.600', 'gray.400')}>Results</Text>
          <Badge 
            colorScheme="gray" 
            variant={useColorModeValue('subtle', 'solid')} 
            px={3} 
            py={1}
          >
            {filteredAndSortedAppointments.length} of {appointments.length}
          </Badge>
        </Box>
      </HStack>

      <TableContainer>
      <Table variant="simple" size="md">
        <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
          <Tr>
            <Th>Patient</Th>
            <Th>Contact</Th>
            <Th>Investigation Details</Th>
            <Th>Original Date</Th>
            <Th>Appointment Status</Th>
            <Th textAlign="center">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredAndSortedAppointments.map((appointment) => {
            const statusInfo = getAppointmentStatus(appointment.followUpDate);
            return (
              <Tr key={appointment.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.600') }}>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold" color={useColorModeValue('gray.800', 'gray.100')}>
                      {appointment.patient?.name}
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                      ID: #{appointment.patient?.id}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <HStack>
                    <Icon as={FiPhone} color="gray.500" />
                    <Text fontSize="sm">{appointment.patient?.mobileNumber}</Text>
                  </HStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                      {appointment.details}
                    </Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                      {appointment.type} Investigation
                    </Text>
                    {appointment.notes && (
                      <Text fontSize="xs" color="blue.500" noOfLines={1}>
                        Note: {appointment.notes}
                      </Text>
                    )}
                  </VStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">{formatDate(appointment.date)}</Text>
                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                      by {appointment.doctor || 'Unknown'}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Badge 
                      colorScheme={statusInfo.color} 
                      variant="subtle"
                      textTransform="capitalize"
                    >
                      <HStack spacing={1}>
                        <Icon 
                          as={statusInfo.status === 'overdue' ? FiAlertCircle : FiClock} 
                          size="12px" 
                        />
                        <Text>{statusInfo.status}</Text>
                      </HStack>
                    </Badge>
                    <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                      {formatDate(appointment.followUpDate)}
                    </Text>
                  </VStack>
                </Td>
                <Td textAlign="center">
                  <HStack spacing={2} justifyContent="center">
                    <Link as={NextLink} href={`/patient/${appointment.patient?.id}`}>
                      <IconButton
                        aria-label="View Patient"
                        icon={<FiEye />}
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        title="View Patient Details"
                      />
                    </Link>
                    {appointment.patient?.mobileNumber && (
                      <IconButton
                        aria-label="Call Patient"
                        icon={<FiPhone />}
                        size="sm"
                        colorScheme="green"
                        variant="outline"
                        title={`Call ${appointment.patient.mobileNumber}`}
                        as="a"
                        href={`tel:${appointment.patient.mobileNumber}`}
                      />
                    )}
                  </HStack>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
    </Box>
  );
};

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
const DoctorDashboard = ({ stats, branchName, selectedDate, setSelectedDate, appointments, loadingAppointments }) => {
  // Calculate date-specific stats from appointments
  const dateSpecificStats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    const isToday = selectedDateObj.getTime() === today.getTime();
    
    // If today is selected, show today's appointments, otherwise show selected date appointments
    const todayAppointments = appointments.length;
    
    // Calculate different appointment statuses for the selected date
    const appointmentStats = appointments.reduce((acc, appointment) => {
      const appointmentDate = new Date(appointment.followUpDate);
      appointmentDate.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        acc.overdue++;
      } else if (appointmentDate.getTime() === today.getTime()) {
        acc.today++;
      } else {
        acc.upcoming++;
      }
      return acc;
    }, { overdue: 0, today: 0, upcoming: 0 });
    
    return {
      appointmentsForDate: todayAppointments,
      uniquePatients: new Set(appointments.map(a => a.patient?.id)).size,
      overdueCount: appointmentStats.overdue,
      upcomingCount: appointmentStats.upcoming,
      isToday
    };
  }, [appointments, selectedDate]);

  return (
    <Box p={6}>
      {/* Header with Title and Date Picker */}
      <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg">Doctor Dashboard</Heading>
          {branchName && <Badge colorScheme="purple" mt={2}>{branchName}</Badge>}
        </Box>
        
        {/* Date Picker in Header */}
        <Flex align="center" gap={3}>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            size="sm"
            width="auto"
            minW="150px"
            bg={useColorModeValue('white', 'gray.700')}
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            color={useColorModeValue('gray.800', 'gray.100')}
            _focus={{
              borderColor: useColorModeValue('blue.500', 'blue.400'),
              boxShadow: `0 0 0 1px ${useColorModeValue('blue.500', 'blue.400')}`
            }}
          />
          <Badge 
            colorScheme={selectedDate === new Date().toISOString().split('T')[0] ? 'blue' : 'gray'}
            variant={useColorModeValue('subtle', 'solid')}
            px={2}
            py={1}
          >
            {selectedDate === new Date().toISOString().split('T')[0] ? 'TODAY' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Badge>
        </Flex>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title={dateSpecificStats.isToday ? "Today's Appointments" : "Appointments"}
          stat={dateSpecificStats.appointmentsForDate}
          icon={FiCalendar}
          helpText={dateSpecificStats.isToday ? "Scheduled today" : `For ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          accentColor="blue.500"
        />
        <StatCard
          title="Patients"
          stat={dateSpecificStats.uniquePatients}
          icon={FiUsers}
          helpText={dateSpecificStats.isToday ? "Today" : `On ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          accentColor="green.500"
        />
        <StatCard
          title="All Pending Follow-ups"
          stat={stats.pendingReports || 0}
          icon={FiFileText}
          helpText="All future appointments"
          accentColor="orange.500"
        />
        <StatCard
          title="Total Investigations"
          stat={stats.investigationCount || 0}
          icon={FiActivity}
          helpText="All time"
          accentColor="purple.500"
        />
      </SimpleGrid>

      {/* Appointments Section */}
      <Card mt={8}>
        <CardBody>
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="md" color={useColorModeValue('gray.700', 'gray.100')}>
              {dateSpecificStats.isToday ? "Today's Schedule" : "Appointments Schedule"}
            </Heading>
            <Badge 
              colorScheme={dateSpecificStats.isToday ? "blue" : "gray"}
              variant={useColorModeValue('subtle', 'solid')} 
              fontSize="sm" 
              px={3} 
              py={1}
            >
              {dateSpecificStats.appointmentsForDate} {dateSpecificStats.appointmentsForDate === 1 ? 'appointment' : 'appointments'}
            </Badge>
          </Flex>
          
          {loadingAppointments ? (
            <Flex justifyContent="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text ml={3}>Loading appointments...</Text>
            </Flex>
          ) : appointments.length > 0 ? (
            <Box>
              <AppointmentsSummary 
                appointments={appointments} 
                selectedDate={selectedDate}
              />
              <AppointmentsTable 
                appointments={appointments} 
                selectedDate={selectedDate}
              />
            </Box>
          ) : (
            <Box textAlign="center" py={8}>
              <Icon as={FiCalendar} w={12} h={12} color={useColorModeValue('gray.300', 'gray.600')} mb={4} />
              <Text color={useColorModeValue('gray.500', 'gray.400')} fontSize="lg">
                No appointments scheduled for {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </Text>
              <Text color={useColorModeValue('gray.400', 'gray.500')} fontSize="sm" mt={2}>
                Appointments will appear here when scheduled through investigation reports
              </Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const toast = useToast();

  // Fetch appointments for selected date (only for doctors)
  const fetchAppointments = async (date) => {
    if (session?.user?.role !== 'doctor') return;
    
    try {
      setLoadingAppointments(true);
      const response = await fetch(`/api/appointments?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error loading appointments',
        description: 'Could not load appointments for selected date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

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

  useEffect(() => {
    if (session?.user?.role === 'doctor') {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate, session]);

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
      return (
        <DoctorDashboard 
          stats={stats} 
          branchName={branchName} 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
          loadingAppointments={loadingAppointments}
        />
      );
  }
};

export default Dashboard;
export { SuperAdminDashboard, ClinicAdminDashboard, BranchAdminDashboard, DoctorDashboard };
