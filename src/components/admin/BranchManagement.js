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
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Select,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import apiClient from '@/lib/api/client';
import ConfirmationDialog from '../common/ConfirmationDialog';

// Validation schema for branch form
const BranchSchema = Yup.object().shape({
  name: Yup.string()
    .required('Branch name is required')
    .min(3, 'Name must be at least 3 characters'),
  address: Yup.string()
    .required('Address is required'),
  contactEmail: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  contactPhone: Yup.string()
    .required('Phone number is required'),
  clinicId: Yup.string()
    .required('Clinic selection is required'),
});

// Branch Form Component
const BranchForm = ({ initialValues, onSubmit, clinics }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={BranchSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="name">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.name && form.touched.name} mb={4}>
                <FormLabel>Branch Name</FormLabel>
                <Input {...field} disabled={isSubmitting} />
                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="address">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.address && form.touched.address} mb={4}>
                <FormLabel>Address</FormLabel>
                <Input {...field} disabled={isSubmitting} />
                <FormErrorMessage>{form.errors.address}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="contactEmail">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.contactEmail && form.touched.contactEmail} mb={4}>
                <FormLabel>Contact Email</FormLabel>
                <Input {...field} type="email" disabled={isSubmitting} />
                <FormErrorMessage>{form.errors.contactEmail}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="contactPhone">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.contactPhone && form.touched.contactPhone} mb={4}>
                <FormLabel>Contact Phone</FormLabel>
                <Input {...field} disabled={isSubmitting} />
                <FormErrorMessage>{form.errors.contactPhone}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field name="clinicId">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.clinicId && form.touched.clinicId} mb={4}>
                <FormLabel>Clinic</FormLabel>
                <Select {...field} placeholder="Select clinic" disabled={isSubmitting}>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                  ))}
                </Select>
                <FormErrorMessage>{form.errors.clinicId}</FormErrorMessage>
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
            disabled={isSubmitting}
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};

// Main Branch Management Component
const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [deletingBranchId, setDeletingBranchId] = useState(null);
  const [branchToDelete, setBranchToDelete] = useState(null);
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
    clinicId: '',
    isActive: true,
  };

  // Fetch branches and clinics on component mount
  useEffect(() => {
    fetchBranches();
    fetchClinics();
  }, []);

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/branches');
      setBranches(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch branches',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clinics for dropdown
  const fetchClinics = async () => {
    try {
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
    }
  };

  // Handle adding a new branch
  const handleAddBranch = () => {
    setSelectedBranch(null);
    onOpen();
  };

  // Handle editing an existing branch
  const handleEditBranch = (branch) => {
    setSelectedBranch(branch);
    onOpen();
  };

  // Handle delete button click - show confirmation
  const handleDeleteClick = (branch) => {
    setBranchToDelete(branch);
    onDeleteOpen();
  };

  // Handle confirmed deletion
  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    
    try {
      setDeletingBranchId(branchToDelete.id);
      await apiClient.delete(`/branches/${branchToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Branch deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Refresh branches list
      fetchBranches();
      onDeleteClose();
      setBranchToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete branch',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeletingBranchId(null);
    }
  };

  // Handle delete dialog close
  const handleDeleteCancel = () => {
    setBranchToDelete(null);
    onDeleteClose();
  };

  // Submit handler for branch form
  const handleSubmit = async (values, actions) => {
    try {
      if (selectedBranch) {
        // Update existing branch
        await apiClient.put(`/branches/${selectedBranch.id}`, values);
        toast({
          title: 'Success',
          description: 'Branch updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new branch
        await apiClient.post('/branches', values);
        toast({
          title: 'Success',
          description: 'Branch added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Refresh branches list and close modal
      fetchBranches();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save branch',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  // Function to get clinic name by ID
  const getClinicName = (clinicId) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic ? clinic.name : 'Unknown Clinic';
  };

  // Check if user has permission to add/edit branches
  const canManageBranches = ['superadmin', 'clinicadmin'].includes(user?.role);

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">Branch Management</Heading>
        {canManageBranches && (
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleAddBranch}>
            Add Branch
          </Button>
        )}
      </Flex>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Clinic</Th>
            <Th>Address</Th>
            <Th>Contact</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {branches.map((branch) => (
            <Tr key={branch.id}>
              <Td>{branch.name}</Td>
              <Td>{branch.clinic?.name || getClinicName(branch.clinicId)}</Td>
              <Td>{branch.address}</Td>
              <Td>
                {branch.contactEmail}<br />
                {branch.contactPhone}
              </Td>
              <Td>
                <Badge colorScheme={branch.isActive ? 'green' : 'red'}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
              <Td>
                <Flex>
                  {canManageBranches && (
                    <>
                      <IconButton
                        icon={<FiEdit />}
                        aria-label="Edit branch"
                        mr={2}
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBranch(branch)}
                        disabled={deletingBranchId === branch.id}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Delete branch"
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        isLoading={deletingBranchId === branch.id}
                        onClick={() => handleDeleteClick(branch)}
                        disabled={deletingBranchId === branch.id}
                      />
                    </>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add/Edit Branch Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedBranch ? 'Edit Branch' : 'Add New Branch'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <BranchForm
              initialValues={selectedBranch || initialValues}
              onSubmit={handleSubmit}
              clinics={clinics}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteBranch}
        title="Delete Branch"
        message={`Are you sure you want to delete "${branchToDelete?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deletingBranchId === branchToDelete?.id}
      />
    </Box>
  );
};

export default BranchManagement;
