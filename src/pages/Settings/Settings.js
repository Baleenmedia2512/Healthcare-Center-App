import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,  CardBody,
  CardHeader,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  HStack,
  Select,
  SimpleGrid,
  useToast,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import {  FiSave,
  FiSettings,
  FiDatabase,
  FiDownload,
  FiUpload,
} from 'react-icons/fi';
import { useAuth } from '../../lib/auth/AuthContext';
import UserManagement from '../../components/admin/UserManagement';

const Settings = () => {  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { hasRole } = useAuth();
  
  const [generalSettings, setGeneralSettings] = useState({
    clinicName: 'HealthCare Center',
    address: '123 Medical Street, Health City',
    phone: '+1 (555) 123-4567',
    email: 'info@healthcare.com',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    enableNotifications: true,
    enableSMS: false,
    maxPatientRecords: 10000,
  });

  const handleSaveGeneral = () => {
    // Save general settings logic here
    toast({
      title: 'Settings Saved',
      description: 'General settings have been updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSaveSystem = () => {
    // Save system settings logic here
    toast({
      title: 'Settings Saved',
      description: 'System settings have been updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleExportData = () => {
    // Export data logic here
    toast({
      title: 'Export Started',
      description: 'Data export has been initiated. You will receive a download link shortly.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleImportData = () => {
    // Import data logic here
    toast({
      title: 'Import Ready',
      description: 'Please select a file to import.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6}>
      <Heading mb={6} color="brand.500">Settings</Heading>
      
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>General</Tab>
          <Tab>System</Tab>
          <Tab>Data Management</Tab>
          {hasRole('admin') && <Tab>User Management</Tab>}
        </TabList>

        <TabPanels>
          {/* General Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiSettings} />
                  <Heading size="md">General Settings</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Clinic Name</FormLabel>
                      <Input
                        value={generalSettings.clinicName}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          clinicName: e.target.value
                        })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        value={generalSettings.phone}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          phone: e.target.value
                        })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        type="email"
                        value={generalSettings.email}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          email: e.target.value
                        })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        value={generalSettings.currency}
                        onChange={(e) => setGeneralSettings({
                          ...generalSettings,
                          currency: e.target.value
                        })}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Input
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        address: e.target.value
                      })}
                    />
                  </FormControl>

                  <HStack>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Dark Mode</FormLabel>
                      <Switch
                        isChecked={colorMode === 'dark'}
                        onChange={toggleColorMode}
                      />
                    </FormControl>
                  </HStack>

                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="brand"
                    onClick={handleSaveGeneral}
                    alignSelf="flex-start"
                  >
                    Save General Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* System Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiDatabase} />
                  <Heading size="md">System Settings</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Auto Backup</FormLabel>
                      <Switch
                        isChecked={systemSettings.autoBackup}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          autoBackup: e.target.checked
                        })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Backup Frequency</FormLabel>
                      <Select
                        value={systemSettings.backupFrequency}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          backupFrequency: e.target.value
                        })}
                        isDisabled={!systemSettings.autoBackup}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </Select>
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Enable Notifications</FormLabel>
                      <Switch
                        isChecked={systemSettings.enableNotifications}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          enableNotifications: e.target.checked
                        })}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Enable SMS</FormLabel>
                      <Switch
                        isChecked={systemSettings.enableSMS}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          enableSMS: e.target.checked
                        })}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Max Patient Records</FormLabel>
                    <Input
                      type="number"
                      value={systemSettings.maxPatientRecords}
                      onChange={(e) => setSystemSettings({
                        ...systemSettings,
                        maxPatientRecords: parseInt(e.target.value)
                      })}
                    />
                  </FormControl>

                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="brand"
                    onClick={handleSaveSystem}
                    alignSelf="flex-start"
                  >
                    Save System Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Data Management */}
          <TabPanel>
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiDatabase} />
                  <Heading size="md">Data Management</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Text color="gray.600">
                    Manage your healthcare data with backup and restore options.
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Card variant="outline">
                      <CardBody>
                        <VStack spacing={3}>
                          <Icon as={FiDownload} boxSize={8} color="green.500" />
                          <Heading size="sm">Export Data</Heading>
                          <Text fontSize="sm" textAlign="center" color="gray.600">
                            Download all your patient records.
                          </Text>
                          <Button
                            leftIcon={<FiDownload />}
                            colorScheme="green"
                            onClick={handleExportData}
                            size="sm"
                          >
                            Export All Data
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card variant="outline">
                      <CardBody>
                        <VStack spacing={3}>
                          <Icon as={FiUpload} boxSize={8} color="blue.500" />
                          <Heading size="sm">Import Data</Heading>
                          <Text fontSize="sm" textAlign="center" color="gray.600">
                            Upload and restore data from a backup file.
                          </Text>
                          <Button
                            leftIcon={<FiUpload />}
                            colorScheme="blue"
                            onClick={handleImportData}
                            size="sm"
                          >
                            Import Data
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  <Box p={4} bg="yellow.50" borderRadius="md" borderLeft="4px" borderColor="yellow.400">
                    <Text fontSize="sm" color="yellow.800">
                      <strong>Note:</strong> Always backup your data before making major changes. 
                      Data imports will overwrite existing records.
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* User Management - Admin Only */}
          {hasRole('admin') && (            <TabPanel>
              <UserManagement />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings;
