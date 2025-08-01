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
    switch (reportType) {
      case 'patient':
        return (
          <Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6" mb="6">
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Total Patients</StatLabel>
                    <StatNumber fontSize="2xl">{totalPatients}</StatNumber>
                  </Box>
                  <Box my="auto" color="brand.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Male Patients</StatLabel>
                    <StatNumber fontSize="2xl">{malePatients}</StatNumber>
                    <StatHelpText mb={0}>
                      {totalPatients ? Math.round((malePatients / totalPatients) * 100) : 0}%
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="blue.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Female Patients</StatLabel>
                    <StatNumber fontSize="2xl">{femalePatients}</StatNumber>
                    <StatHelpText mb={0}>
                      {totalPatients ? Math.round((femalePatients / totalPatients) * 100) : 0}%
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="pink.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">New This Month</StatLabel>
                    <StatNumber fontSize="2xl">2</StatNumber>
                    <StatHelpText mb={0}>
                      Since {new Date().toLocaleString('default', { month: 'long' })} 1
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="green.500">
                    <Icon as={FiCalendar} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
            </SimpleGrid>
            
            <Card>
              <CardHeader bg="brand.50" py="3">
                <Heading size="md">Patient Demographics Report</Heading>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Parameter</Th>
                        <Th isNumeric>Count</Th>
                        <Th isNumeric>Percentage</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="medium">Total Patients</Td>
                        <Td isNumeric>{totalPatients}</Td>
                        <Td isNumeric>100%</Td>
                      </Tr>
                      <Tr>
                        <Td>Male</Td>
                        <Td isNumeric>{malePatients}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((malePatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Female</Td>
                        <Td isNumeric>{femalePatients}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((femalePatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Other</Td>
                        <Td isNumeric>{otherPatients}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((otherPatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Age 0-18</Td>
                        <Td isNumeric>{patients.filter(p => p.age < 18).length}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((patients.filter(p => p.age < 18).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Age 19-40</Td>
                        <Td isNumeric>{patients.filter(p => p.age >= 18 && p.age <= 40).length}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((patients.filter(p => p.age >= 18 && p.age <= 40).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Age 41-60</Td>
                        <Td isNumeric>{patients.filter(p => p.age > 40 && p.age <= 60).length}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((patients.filter(p => p.age > 40 && p.age <= 60).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Age 60+</Td>
                        <Td isNumeric>{patients.filter(p => p.age > 60).length}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((patients.filter(p => p.age > 60).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
            
            <Box mt="6">
              <Text fontSize="sm" color="gray.600">
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
