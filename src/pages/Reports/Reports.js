import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiBarChart2,
  FiPieChart,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiDownload,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const Reports = () => {
  const { patients } = useAppContext();
  const [reportType, setReportType] = useState('patient');
  const [timeRange, setTimeRange] = useState('all');
  
  // Calculate patient statistics
  const totalPatients = patients.length;
  const malePatients = patients.filter(patient => patient.sex === 'Male').length;
  const femalePatients = patients.filter(patient => patient.sex === 'Female').length;
  const otherPatients = totalPatients - malePatients - femalePatients;
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Render different report types
  const renderReport = () => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderCol = useColorModeValue('gray.200', 'gray.700');
    const labelColor = useColorModeValue('gray.600', 'gray.300');
    const statColor = useColorModeValue('gray.800', 'gray.100');
    const helpTextColor = useColorModeValue('gray.500', 'gray.400');
    const tableHeadBg = useColorModeValue('gray.50', 'gray.700');
    const tableHeadColor = useColorModeValue('gray.600', 'gray.100');
    const tableRowBg = useColorModeValue('white', 'gray.800');
    const tableRowAltBg = useColorModeValue('gray.50', 'gray.700');
    const tableTextColor = useColorModeValue('gray.800', 'gray.100');
    const cardHeaderBg = useColorModeValue('brand.50', 'gray.700');
    const infoTextColor = useColorModeValue('gray.600', 'gray.400');
    switch (reportType) {
      case 'patient':
        return (
          <Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6" mb="6">
              {/* Total Patients */}
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor={borderCol}
                rounded="lg"
                bg={cardBg}
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium" color={labelColor}>Total Patients</StatLabel>
                    <StatNumber fontSize="2xl" color={statColor}>{totalPatients}</StatNumber>
                  </Box>
                  <Box my="auto" color="brand.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              {/* Male Patients */}
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor={borderCol}
                rounded="lg"
                bg={cardBg}
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium" color={labelColor}>Male Patients</StatLabel>
                    <StatNumber fontSize="2xl" color={statColor}>{malePatients}</StatNumber>
                    <StatHelpText mb={0} color={helpTextColor}>
                      {totalPatients ? Math.round((malePatients / totalPatients) * 100) : 0}%
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="blue.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              {/* Female Patients */}
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor={borderCol}
                rounded="lg"
                bg={cardBg}
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium" color={labelColor}>Female Patients</StatLabel>
                    <StatNumber fontSize="2xl" color={statColor}>{femalePatients}</StatNumber>
                    <StatHelpText mb={0} color={helpTextColor}>
                      {totalPatients ? Math.round((femalePatients / totalPatients) * 100) : 0}%
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="pink.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              {/* New This Month */}
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor={borderCol}
                rounded="lg"
                bg={cardBg}
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium" color={labelColor}>New This Month</StatLabel>
                    <StatNumber fontSize="2xl" color={statColor}>2</StatNumber>
                    <StatHelpText mb={0} color={helpTextColor}>
                      Since {new Date().toLocaleString('default', { month: 'long' })} 1
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="green.500">
                    <Icon as={FiCalendar} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
            </SimpleGrid>
            {/* Patient Demographics Table */}
            <Card bg={cardBg} borderColor={borderCol}>
              <CardHeader bg={cardHeaderBg} py="3">
                <Heading size="md" color={statColor}>Patient Demographics Report</Heading>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg={tableHeadBg}>
                      <Tr>
                        <Th color={tableHeadColor} borderColor={borderCol}>Parameter</Th>
                        <Th isNumeric color={tableHeadColor} borderColor={borderCol}>Count</Th>
                        <Th isNumeric color={tableHeadColor} borderColor={borderCol}>Percentage</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr 
                        bg={tableRowBg} 
                        color={tableTextColor}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Td fontWeight="medium" borderColor={borderCol}>Total Patients</Td>
                        <Td isNumeric borderColor={borderCol}>{totalPatients}</Td>
                        <Td isNumeric borderColor={borderCol}>100%</Td>
                      </Tr>
                      <Tr 
                        bg={tableRowAltBg} 
                        color={tableTextColor}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Td borderColor={borderCol}>Male</Td>
                        <Td isNumeric borderColor={borderCol}>{malePatients}</Td>
                        <Td isNumeric borderColor={borderCol}>
                          {totalPatients ? Math.round((malePatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr 
                        bg={tableRowBg} 
                        color={tableTextColor}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Td borderColor={borderCol}>Female</Td>
                        <Td isNumeric borderColor={borderCol}>{femalePatients}</Td>
                        <Td isNumeric borderColor={borderCol}>
                          {totalPatients ? Math.round((femalePatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr 
                        bg={tableRowAltBg} 
                        color={tableTextColor}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Td borderColor={borderCol}>Other</Td>
                        <Td isNumeric borderColor={borderCol}>{otherPatients}</Td>
                        <Td isNumeric borderColor={borderCol}>
                          {totalPatients ? Math.round((otherPatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr 
                        bg={tableRowBg} 
                        color={tableTextColor}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Td borderColor={borderCol}>Age 0-18</Td>
                        <Td isNumeric borderColor={borderCol}>{patients.filter(p => p.age < 18).length}</Td>
                        <Td isNumeric borderColor={borderCol}>
                          {totalPatients ? Math.round((patients.filter(p => p.age < 18).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr 
                        bg={tableRowAltBg} 
                        color={tableTextColor}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Td borderColor={borderCol}>Age 19-40</Td>
                        <Td isNumeric borderColor={borderCol}>{patients.filter(p => p.age >= 18 && p.age <= 40).length}</Td>
                        <Td isNumeric borderColor={borderCol}>
                          {totalPatients ? Math.round((patients.filter(p => p.age >= 18 && p.age <= 40).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr 
                        bg={tableRowBg} 
                        color={tableTextColor}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Td borderColor={borderCol}>Age 41-60</Td>
                        <Td isNumeric borderColor={borderCol}>{patients.filter(p => p.age > 40 && p.age <= 60).length}</Td>
                        <Td isNumeric borderColor={borderCol}>
                          {totalPatients ? Math.round((patients.filter(p => p.age > 40 && p.age <= 60).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr 
                        bg={tableRowAltBg} 
                        color={tableTextColor}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Td borderColor={borderCol}>Age 60+</Td>
                        <Td isNumeric borderColor={borderCol}>{patients.filter(p => p.age > 60).length}</Td>
                        <Td isNumeric borderColor={borderCol}>
                          {totalPatients ? Math.round((patients.filter(p => p.age > 60).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
            <Box mt="6">
              <Text fontSize="sm" color={infoTextColor}>
                * In a real application, this section would include interactive charts and graphs 
                showing patient demographics, age distribution, and more detailed analytics.
              </Text>
            </Box>
          </Box>
        );
      
      default:
        return <Text>Select a report type to view analytics</Text>;
    }
  };
  
  return (
    <Box>
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }}
        mb="6"
      >
        <Heading size="lg" mb={{ base: 4, md: 0 }}>Reports & Analytics</Heading>
        
        <HStack spacing="3">
          <Select 
            maxW="200px" 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="patient">Patient Demographics</option>
          </Select>
          
          <Select 
            maxW="150px"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </Select>
          
          <Button leftIcon={<FiDownload />} variant="outline">
            Export Report
          </Button>
        </HStack>
      </Flex>
      
      {renderReport()}
    </Box>
  );
};

export default Reports;
