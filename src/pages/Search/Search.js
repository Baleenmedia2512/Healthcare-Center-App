import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  InputGroup,
  InputLeftElement,
  Select,
  Grid,
  GridItem,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiUser, FiCalendar, FiPhone } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';
import Link from 'next/link';

const Search = () => {
  const { patients, investigations, isLoading, error } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [selectedTab, setSelectedTab] = useState(0);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Search logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        patients: patients || [],
        investigations: investigations || [],
        total: (patients?.length || 0) + (investigations?.length || 0)
      };
    }

    const query = searchQuery.toLowerCase();
    
    const filteredPatients = (patients || []).filter(patient => {
      if (searchType === 'investigations') return false;
      
      return (
        patient.name?.toLowerCase().includes(query) ||
        patient.phone?.includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.address?.toLowerCase().includes(query) ||
        patient.id?.toLowerCase().includes(query)
      );
    });

    const filteredInvestigations = (investigations || []).filter(investigation => {
      if (searchType === 'patients') return false;
      
      return (
        investigation.type?.toLowerCase().includes(query) ||
        investigation.notes?.toLowerCase().includes(query) ||
        investigation.results?.toLowerCase().includes(query) ||
        investigation.patientId?.toLowerCase().includes(query)
      );
    });

    return {
      patients: filteredPatients,
      investigations: filteredInvestigations,
      total: filteredPatients.length + filteredInvestigations.length
    };
  }, [searchQuery, searchType, patients, investigations]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search type change
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSelectedTab(e.target.value === 'patients' ? 0 : e.target.value === 'investigations' ? 1 : 0);
  };

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Search Healthcare Records</Heading>
          
          {/* Search Controls */}
          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={4} mb={6}>
            <GridItem>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search patients, investigations, phone numbers..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  bg={cardBg}
                  border="1px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                  }}
                />
              </InputGroup>
            </GridItem>
            
            <GridItem>
              <Select
                value={searchType}
                onChange={handleSearchTypeChange}
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
              >
                <option value="all">All Records</option>
                <option value="patients">Patients Only</option>
                <option value="investigations">Investigations Only</option>
              </Select>
            </GridItem>
          </Grid>

          {/* Search Results Summary */}
          <HStack spacing={4} mb={4}>
            <Text fontSize="sm" color="gray.600">
              {searchQuery.trim() ? (
                <>Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchQuery}"</>
              ) : (
                <>Showing all {searchResults.total} record{searchResults.total !== 1 ? 's' : ''}</>
              )}
            </Text>
            
            {searchQuery.trim() && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </HStack>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Center py={8}>
            <Spinner size="lg" color="brand.500" />
          </Center>
        )}

        {/* Search Results */}
        {!isLoading && (
          <Tabs index={selectedTab} onChange={setSelectedTab}>
            <TabList>
              <Tab>
                Patients 
                <Badge ml={2} colorScheme="blue">
                  {searchResults.patients.length}
                </Badge>
              </Tab>
              <Tab>
                Investigations 
                <Badge ml={2} colorScheme="green">
                  {searchResults.investigations.length}
                </Badge>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Patients Tab */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {searchResults.patients.length === 0 ? (
                    <Center py={8}>
                      <Text color="gray.500">
                        {searchQuery.trim() ? 'No patients found matching your search.' : 'No patients available.'}
                      </Text>
                    </Center>
                  ) : (
                    searchResults.patients.map((patient) => (
                      <Card key={patient.id} bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={4}>
                            <GridItem>
                              <VStack align="start" spacing={2}>
                                <HStack>
                                  <FiUser />
                                  <Link href={`/patient/${patient.id}`} passHref>
                                    <Text
                                      as="a"
                                      fontWeight="bold"
                                      color="brand.500"
                                      _hover={{ textDecoration: 'underline' }}
                                    >
                                      {patient.name}
                                    </Text>
                                  </Link>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  ID: {patient.id}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {patient.address}
                                </Text>
                              </VStack>
                            </GridItem>
                            
                            <GridItem>
                              <VStack align="start" spacing={2}>
                                <HStack>
                                  <FiPhone />
                                  <Text fontSize="sm">{patient.phone}</Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {patient.email}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  Age: {patient.age} | Gender: {patient.gender}
                                </Text>
                              </VStack>
                            </GridItem>
                            
                            <GridItem>
                              <VStack align="start" spacing={2}>
                                <HStack>
                                  <FiCalendar />
                                  <Text fontSize="sm">
                                    Registered: {formatDate(patient.createdAt)}
                                  </Text>
                                </HStack>
                                <Badge colorScheme="blue" size="sm">
                                  Patient
                                </Badge>
                              </VStack>
                            </GridItem>
                          </Grid>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </TabPanel>

              {/* Investigations Tab */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {searchResults.investigations.length === 0 ? (
                    <Center py={8}>
                      <Text color="gray.500">
                        {searchQuery.trim() ? 'No investigations found matching your search.' : 'No investigations available.'}
                      </Text>
                    </Center>
                  ) : (
                    searchResults.investigations.map((investigation) => (
                      <Card key={investigation.id} bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={4}>
                            <GridItem>
                              <VStack align="start" spacing={2}>
                                <Text fontWeight="bold">{investigation.type}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  Patient ID: {investigation.patientId}
                                </Text>
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  {investigation.notes}
                                </Text>
                              </VStack>
                            </GridItem>
                            
                            <GridItem>
                              <VStack align="start" spacing={2}>
                                <Text fontSize="sm" fontWeight="medium">
                                  Status: {investigation.status || 'Pending'}
                                </Text>
                                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                  Results: {investigation.results || 'Pending'}
                                </Text>
                              </VStack>
                            </GridItem>
                            
                            <GridItem>
                              <VStack align="start" spacing={2}>
                                <HStack>
                                  <FiCalendar />
                                  <Text fontSize="sm">
                                    {formatDate(investigation.createdAt)}
                                  </Text>
                                </HStack>
                                <Badge colorScheme="green" size="sm">
                                  Investigation
                                </Badge>
                              </VStack>
                            </GridItem>
                          </Grid>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>
    </Box>
  );
};

export default Search;
