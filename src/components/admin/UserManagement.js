import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
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
  Select,
  VStack,
  HStack,
  useToast,
  Badge,
  IconButton,
  Text,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiUsers } from 'react-icons/fi';
import { UserService } from '../../lib/api';
import { useAuth } from '../../lib/auth/AuthContext';
import { useSession } from 'next-auth/react';
import { AUTH_CONFIG } from '../../config';
import apiClient from '../../lib/api/client';

const UserManagement = ({ 
  restrictedRole = null, 
  title = "User Management", 
  description = "Manage users in the system" 
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { hasRole } = useAuth();

  const [clinics, setClinics] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: restrictedRole || AUTH_CONFIG.roles.DOCTOR,
    clinicId: '',
    branchId: '',
  });

  // Update form role when restrictedRole prop changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      role: restrictedRole || AUTH_CONFIG.roles.DOCTOR
    }));
  }, [restrictedRole]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await UserService.getAllUsers();
      // Filter users by restricted role if specified
      const filteredUsers = restrictedRole 
        ? data.filter(user => user.role === restrictedRole)
        : data;
      setUsers(filteredUsers);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast, restrictedRole]);

  // Fetch clinics for dropdown
  const fetchClinics = useCallback(async () => {
    try {
      setLoadingTenants(true);
      const response = await apiClient.get('/clinics');
      setClinics(response.data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch clinics',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingTenants(false);
    }
  }, [toast]);

  // Fetch branches for dropdown based on selected clinic
  const fetchBranches = useCallback(async (clinicId) => {
    if (!clinicId) {
      setBranches([]);
      return;
    }
    
    try {
      setLoadingTenants(true);
      const response = await apiClient.get('/branches', {
        params: { clinicId }
      });
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch branches',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingTenants(false);
    }
  }, [toast]);
  
  // Handle clinic change in form
  const handleClinicChange = (e) => {
    const clinicId = e.target.value;
    setFormData({ 
      ...formData, 
      clinicId,
      branchId: '' // Reset branch when clinic changes
    });
    
    fetchBranches(clinicId);
  };

  useEffect(() => {
    // Check if user has role with appropriate permissions
    const validRoles = ['superadmin', 'clinicadmin', 'branchadmin', 'admin'];
    if (validRoles.includes(session?.user?.role)) {
      fetchUsers();
      fetchClinics();
      
      // Auto-populate clinic and branch for branch admins
      if (session.user.role === 'branchadmin') {
        setFormData(prev => ({
          ...prev,
          clinicId: session.user.clinicId || '',
          branchId: session.user.branchId || ''
        }));
        
        // Fetch branches for the branch admin's clinic
        if (session.user.clinicId) {
          fetchBranches(session.user.clinicId);
        }
      }
    }
  }, [session, fetchUsers, fetchClinics, fetchBranches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedUser) {
        // Update user
        await UserService.updateUser(selectedUser.id, formData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new user
        await UserService.createUser(formData);
        toast({
          title: 'Success',
          description: 'User created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      password: '',
      role: user.role,
      clinicId: user.clinicId || '',
      branchId: user.branchId || '',
    });
    
    // Fetch branches for the selected clinic
    if (user.clinicId) {
      fetchBranches(user.clinicId);
    }
    
    onOpen();
  };

  const handleClose = () => {
    setSelectedUser(null);
    
    // For branch admins, preserve their clinic and branch
    const defaultFormData = {
      email: '',
      fullName: '',
      password: '',
      role: restrictedRole || AUTH_CONFIG.roles.DOCTOR,
      clinicId: session?.user?.role === 'branchadmin' ? (session.user.clinicId || '') : '',
      branchId: session?.user?.role === 'branchadmin' ? (session.user.branchId || '') : '',
    };
    
    setFormData(defaultFormData);
    setBranches([]);
    onClose();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': return 'red';
      case 'clinicadmin': return 'blue';
      case 'branchadmin': return 'purple';
      case 'doctor': return 'green';
      case 'admin': return 'orange'; // Legacy support
      default: return 'gray';
    }
  };

  // Allow access to superadmin, clinicadmin, branchadmin, and legacy admin
  const validRoles = ['superadmin', 'clinicadmin', 'branchadmin', 'admin'];
  if (!session?.user?.role || !validRoles.includes(session.user.role)) {
    return (
      <Box p={6}>
        <Card>
          <CardBody>
            <Text color="red.500">Access Denied: Admin privileges required</Text>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <FiUsers size={24} />
              <Box>
                <Heading size="lg">{title}</Heading>
                <Text fontSize="sm" color="gray.600">{description}</Text>
              </Box>
            </HStack>
            <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onOpen}>
              Add New {restrictedRole ? 
                (restrictedRole === 'clinicadmin' ? 'Clinic Admin' : 
                 restrictedRole === 'branchadmin' ? 'Branch Admin' : 
                 restrictedRole === 'doctor' ? 'Doctor' : 'User') : 'User'}
            </Button>
          </HStack>
        </CardHeader>

        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.fullName}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge colorScheme={getRoleBadgeColor(user.role)} size="sm">
                        {user.role.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.isActive ? 'green' : 'red'} size="sm">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <IconButton
                          icon={<FiEdit />}
                          size="sm"
                          onClick={() => handleEdit(user)}
                          aria-label="Edit user"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Add/Edit User Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {selectedUser ? 'Edit User' : 'Add New User'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    isDisabled={selectedUser} // Don't allow email change for existing users
                  />
                </FormControl>

                <FormControl isRequired={!selectedUser}>
                  <FormLabel>Password {selectedUser && '(leave blank to keep current)'}</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    isDisabled={restrictedRole !== null}
                  >
                    {restrictedRole ? (
                      <option value={restrictedRole}>
                        {restrictedRole === 'clinicadmin' ? 'Clinic Admin' : 
                         restrictedRole === 'branchadmin' ? 'Branch Admin' : 
                         restrictedRole === 'doctor' ? 'Doctor' : restrictedRole}
                      </option>
                    ) : (
                      <>
                        {session?.user?.role === 'superadmin' && (
                          <>
                            <option value="superadmin">Super Admin</option>
                            <option value="clinicadmin">Clinic Admin</option>
                          </>
                        )}
                        {(session?.user?.role === 'superadmin' || session?.user?.role === 'clinicadmin') && (
                          <option value="branchadmin">Branch Admin</option>
                        )}
                        <option value="doctor">Doctor</option>
                      </>
                    )}
                  </Select>
                </FormControl>

                <Divider my={2} />
                
                {/* Tenant Selection */}
                <FormControl isRequired={formData.role !== 'superadmin'}>
                  <FormLabel>Clinic</FormLabel>
                  <Select
                    value={formData.clinicId}
                    onChange={handleClinicChange}
                    placeholder="Select clinic"
                    isDisabled={formData.role === 'superadmin' || loadingTenants || session?.user?.role === 'branchadmin'}
                  >
                    {clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired={['branchadmin', 'doctor'].includes(formData.role)}>
                  <FormLabel>Branch</FormLabel>
                  <Select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    placeholder="Select branch"
                    isDisabled={!formData.clinicId || loadingTenants || ['superadmin', 'clinicadmin'].includes(formData.role) || session?.user?.role === 'branchadmin'}
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={loading}
                loadingText="Saving..."
              >
                {selectedUser ? 'Update' : 'Create'} User
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement;
