import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import apiClient from '@/lib/api/client';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

// Validation schema for clinic form
const ClinicSchema = Yup.object().shape({
  name: Yup.string()
    .required('Clinic name is required')
    .min(3, 'Name must be at least 3 characters'),
  address: Yup.string()
    .required('Address is required'),
  contactEmail: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  contactPhone: Yup.string()
    .required('Phone number is required'),
});

// Clinic Form Component
const ClinicForm = ({ initialValues, onSubmit }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ClinicSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="name">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.name && form.touched.name} mb={4}>
                <FormLabel>Clinic Name</FormLabel>
                <Input {...field} />
                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="address">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.address && form.touched.address} mb={4}>
                <FormLabel>Address</FormLabel>
                <Input {...field} />
                <FormErrorMessage>{form.errors.address}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="contactEmail">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.contactEmail && form.touched.contactEmail} mb={4}>
                <FormLabel>Contact Email</FormLabel>
                <Input {...field} type="email" />
                <FormErrorMessage>{form.errors.contactEmail}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="contactPhone">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.contactPhone && form.touched.contactPhone} mb={4}>
                <FormLabel>Contact Phone</FormLabel>
                <Input {...field} />
                <FormErrorMessage>{form.errors.contactPhone}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Button
            mt={4}
            colorScheme="blue"
            isLoading={isSubmitting}
            loadingText="Saving..."
            type="submit"
            width="100%"
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};

// Main Clinic Management Component
const ClinicManagement = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicToDelete, setClinicToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();

  // Initial form values
  const initialValues = {
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    isActive: true,
  };

  // Fetch clinics on component mount
  useEffect(() => {
    fetchClinics();
  }, []);

  // Fetch clinics from API
  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/clinics');
      setClinics(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch clinics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new clinic
  const handleAddClinic = () => {
    setSelectedClinic(null);
    onOpen();
  };

  // Handle editing an existing clinic
  const handleEditClinic = (clinic) => {
    setSelectedClinic(clinic);
    onOpen();
  };

  // Handle deleting a clinic
  const handleDeleteClinic = (clinic) => {
    setClinicToDelete(clinic);
    onDeleteOpen();
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!clinicToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/clinics/${clinicToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Clinic deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh clinics list
      fetchClinics();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.response?.data?.error || 'Failed to delete clinic',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setClinicToDelete(null);
      onDeleteClose();
    }
  };

  // Submit handler for clinic form
  const handleSubmit = async (values, actions) => {
    try {
      if (selectedClinic) {
        // Update existing clinic
        await apiClient.put(`/clinics/${selectedClinic.id}`, values);
        toast({
          title: 'Success',
          description: 'Clinic updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new clinic
        await apiClient.post('/clinics', values);
        toast({
          title: 'Success',
          description: 'Clinic added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Refresh clinics list and close modal
      fetchClinics();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save clinic',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">Clinic Management</Heading>
        {user.role === 'superadmin' && (
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleAddClinic}>
            Add Clinic
          </Button>
        )}
      </Flex>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Address</Th>
            <Th>Contact</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {clinics.map((clinic) => (
            <Tr key={clinic.id}>
              <Td>{clinic.name}</Td>
              <Td>{clinic.address}</Td>
              <Td>
                {clinic.contactEmail}<br />
                {clinic.contactPhone}
              </Td>
              <Td>
                <Badge colorScheme={clinic.isActive ? 'green' : 'red'}>
                  {clinic.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
              <Td>
                <Flex>
                  {user.role === 'superadmin' && (
                    <>
                      <IconButton
                        icon={<FiEdit />}
                        aria-label="Edit clinic"
                        mr={2}
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClinic(clinic)}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Delete clinic"
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleDeleteClinic(clinic)}
                      />
                    </>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add/Edit Clinic Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedClinic ? 'Edit Clinic' : 'Add New Clinic'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ClinicForm
              initialValues={selectedClinic || initialValues}
              onSubmit={handleSubmit}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Clinic"
        message={
          clinicToDelete 
            ? `Are you sure you want to delete "${clinicToDelete.name}"? This action cannot be undone and will permanently remove all associated data.`
            : 'Are you sure you want to delete this clinic?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default ClinicManagement;
