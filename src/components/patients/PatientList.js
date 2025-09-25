import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,  
  Td,
  TableContainer,
  Text,
  HStack,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useToast,
  Spinner,
  Center,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiMoreVertical,
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { usePatients } from '../../hooks';

const PatientList = () => {
  const router = useRouter();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  
  const { 
    patients, 
    isLoading, 
    error, 
    fetchPatients, 
    deletePatient 
  } = usePatients();

  // Delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const searchValue = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchValue) ||
      patient.mobileNumber.includes(searchValue) ||
      (patient.age && patient.age.toString().includes(searchValue)) ||
      (patient.guardianName && patient.guardianName.toLowerCase().includes(searchValue)) ||
      (patient.address && patient.address.toLowerCase().includes(searchValue)) ||
      (patient.occupation && patient.occupation.toLowerCase().includes(searchValue)) ||
      (patient.chiefComplaints && patient.chiefComplaints.toLowerCase().includes(searchValue))
    );
  });

  // Pagination logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // View patient details
  const viewPatient = (id) => {
    router.push(`/patient/${id}`);
  };

  // Navigate to edit patient page
  const editPatient = (id) => {
    router.push(`/patient/${id}?edit=true`);
  };

  // Confirm patient deletion
  const confirmDelete = (patient) => {
    setPatientToDelete(patient);
    onOpen();
  };

  // Delete the patient
  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      const success = await deletePatient(patientToDelete.id);
      if (success) {
        toast({
          title: 'Patient deleted',
          description: `${patientToDelete.name} has been removed.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete patient',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPatientToDelete(null);
      onClose();
    }
  };

  // Handle call patient
  const handleCallPatient = (mobileNumber, patientName) => {
    if (!mobileNumber) {
      toast({
        title: 'No phone number',
        description: 'This patient has no mobile number on file.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Create tel: link to initiate call
    const telLink = `tel:${mobileNumber}`;
    window.location.href = telLink;
    
    toast({
      title: 'Calling patient',
      description: `Initiating call to ${patientName}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get last investigation date
  const getLastVisitDate = (patient) => {
    if (!patient.investigations || patient.investigations.length === 0) {
      return 'No visits';
    }
    
    const lastInvestigation = patient.investigations.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
    
    return formatDate(lastInvestigation.date);
  };

  // Display loading state
  if (isLoading && !patients.length) {
    return (
      <Center p={8} height="60vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  // Display error state
  if (error && !patients.length) {
    return (
      <Box p={6}>
        <Card>
          <CardBody>
            <Text color="red.500">{error}</Text>
            <Button 
              mt={4} 
              colorScheme="brand" 
              onClick={() => fetchPatients()}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Card>
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <HStack>
              <FiUser size={24} />
              <Heading size="lg">Patients</Heading>
            </HStack>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={() => router.push('/patient/register')}
            >
              New Patient
            </Button>
          </Flex>
        </CardHeader>

        <CardBody>
          {/* Search bar */}
          <Box mb={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search patients by name, mobile, age, guardian, address, occupation, or complaints..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Box>

          {/* Patients table */}
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                <Tr>
                  <Th>Name & Guardian</Th>
                  <Th>Age/Sex</Th>
                  <Th>Mobile</Th>
                  <Th>Address</Th>
                  <Th>Occupation</Th>
                  <Th>Chief Complaints</Th>
                  <Th>Last Visit</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentPatients.length > 0 ? (
                  currentPatients.map((patient) => (
                    <Tr key={patient.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                      <Td>
                        <Box>
                          <Text fontWeight="medium" color={useColorModeValue('gray.900', 'gray.100')}>
                            {patient.name}
                          </Text>
                          {patient.guardianName && (
                            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                              Guardian: {patient.guardianName}
                            </Text>
                          )}
                        </Box>
                      </Td>
                      <Td>
                        <Box>
                          <Text fontWeight="medium">{patient.age} yrs</Text>
                          <Badge 
                            colorScheme={patient.sex === 'Male' ? 'blue' : patient.sex === 'Female' ? 'pink' : 'gray'}
                            size="sm"
                          >
                            {patient.sex}
                          </Badge>
                        </Box>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Text>{patient.mobileNumber}</Text>
                          <Tooltip label={`Call ${patient.name}`} placement="top">
                            <IconButton
                              icon={<FiPhone />}
                              size="xs"
                              colorScheme="green"
                              variant="outline"
                              onClick={() => handleCallPatient(patient.mobileNumber, patient.name)}
                              aria-label="Call patient"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                      <Td maxW="200px">
                        <Tooltip label={patient.address} placement="top">
                          <Text 
                            fontSize="sm" 
                            noOfLines={2}
                            color={useColorModeValue('gray.600', 'gray.400')}
                          >
                            <FiMapPin style={{ display: 'inline', marginRight: '4px' }} />
                            {patient.address}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Text 
                          fontSize="sm"
                          color={useColorModeValue('gray.700', 'gray.300')}
                        >
                          {patient.occupation || 'N/A'}
                        </Text>
                      </Td>
                      <Td maxW="250px">
                        <Tooltip label={patient.chiefComplaints} placement="top">
                          <Text 
                            fontSize="sm" 
                            noOfLines={2}
                            color={useColorModeValue('gray.600', 'gray.400')}
                          >
                            {patient.chiefComplaints}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <FiCalendar size={12} />
                          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                            {getLastVisitDate(patient)}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="View patient details" placement="top">
                            <IconButton
                              icon={<FiEye />}
                              variant="outline"
                              onClick={() => viewPatient(patient.id)}
                              aria-label="View patient"
                              size="sm"
                            />
                          </Tooltip>
                          <Tooltip label="Edit patient" placement="top">
                            <IconButton
                              icon={<FiEdit2 />}
                              variant="outline"
                              onClick={() => editPatient(patient.id)}
                              aria-label="Edit patient"
                              size="sm"
                            />
                          </Tooltip>
                          <Tooltip label="Delete patient" placement="top">
                            <IconButton
                              icon={<FiTrash2 />}
                              variant="outline"
                              colorScheme="red"
                              onClick={() => confirmDelete(patient)}
                              aria-label="Delete patient"
                              size="sm"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={8}>
                      <Text color={useColorModeValue('gray.500', 'gray.400')}>
                        {searchTerm ? 'No patients match your search.' : 'No patients found.'}
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justifyContent="center" mt={4}>
              <HStack>
                <Button
                  leftIcon={<FiChevronLeft />}
                  onClick={() => paginate(currentPage - 1)}
                  isDisabled={currentPage === 1}
                  size="sm"
                >
                  Previous
                </Button>
                
                <Text mx={2}>
                  Page {currentPage} of {totalPages}
                </Text>
                
                <Button
                  rightIcon={<FiChevronRight />}
                  onClick={() => paginate(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Patient
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {patientToDelete?.name}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeletePatient} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PatientList;
