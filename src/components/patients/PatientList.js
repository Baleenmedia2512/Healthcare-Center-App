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
      (patient.age && patient.age.toString().includes(searchValue))
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
                placeholder="Search patients by name, mobile, or age..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Box>

          {/* Patients table */}
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Age</Th>
                  <Th>Sex</Th>
                  <Th>Mobile</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentPatients.length > 0 ? (
                  currentPatients.map((patient) => (
                    <Tr key={patient.id}>
                      <Td>{patient.name}</Td>
                      <Td>{patient.age}</Td>
                      <Td>{patient.sex}</Td>
                      <Td>{patient.mobileNumber}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiEye />}
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => viewPatient(patient.id)}
                            aria-label="View patient"
                            size="sm"
                          />
                          <IconButton
                            icon={<FiEdit2 />}
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => editPatient(patient.id)}
                            aria-label="Edit patient"
                            size="sm"
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => confirmDelete(patient)}
                            aria-label="Delete patient"
                            size="sm"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      {searchTerm ? 'No patients match your search.' : 'No patients found.'}
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
