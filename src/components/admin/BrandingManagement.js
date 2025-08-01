import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Divider,
  Flex,
  Grid,
  GridItem,
  Image,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FiUpload, FiSave } from 'react-icons/fi';
import apiClient from '@/lib/api/client';
import { useSession } from 'next-auth/react';
import ClinicLogo from '../common/ClinicLogo';

// Validation schema for branding form
const BrandingSchema = Yup.object().shape({
  primaryColor: Yup.string()
    .matches(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid HEX color code')
    .required('Primary color is required'),
  secondaryColor: Yup.string()
    .matches(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid HEX color code')
    .required('Secondary color is required'),
  customDomain: Yup.string()
    .nullable()
    .matches(/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, 'Must be a valid domain')
    .optional(),
  customCss: Yup.string()
    .nullable()
    .optional(),
});

const BrandingManagement = ({ clinicId }) => {
  const { data: session } = useSession();
  const [branding, setBranding] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');

  // If clinicId not provided, use the one from the session
  const targetClinicId = clinicId || session?.user?.clinicId;

  // Load branding data
  useEffect(() => {
    const fetchBranding = async () => {
      if (!targetClinicId) return;
      
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/api/clinics/${targetClinicId}/branding`);
        setBranding(response.data);
      } catch (error) {
        console.error('Error fetching branding:', error);
        toast({
          title: 'Error fetching branding',
          description: error.response?.data?.error || error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBranding();
  }, [targetClinicId, toast]);
  
  // Handle branding form submission
  const handleBrandingSubmit = async (values, actions) => {
    if (!targetClinicId) return;
    
    try {
      const response = await apiClient.put(`/api/clinics/${targetClinicId}/branding`, values);
      setBranding(response.data);
      toast({
        title: 'Branding updated',
        description: 'The branding settings have been saved successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating branding:', error);
      toast({
        title: 'Error updating branding',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };
  
  // Handle logo file change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle favicon file change
  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFaviconFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setFaviconPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!logoFile || !targetClinicId) return;
    
    const formData = new FormData();
    formData.append('file', logoFile);
    formData.append('type', 'logo');
    formData.append('clinicId', targetClinicId);
    
    try {
      const response = await apiClient.post(
        `/api/upload/clinic-asset`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setBranding(response.data.clinic);
      setLogoFile(null);
      setLogoPreview('');
      
      toast({
        title: 'Logo uploaded',
        description: 'The clinic logo has been uploaded successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error uploading logo',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle favicon upload
  const handleFaviconUpload = async () => {
    if (!faviconFile || !targetClinicId) return;
    
    const formData = new FormData();
    formData.append('file', faviconFile);
    formData.append('type', 'favicon');
    formData.append('clinicId', targetClinicId);
    
    try {
      const response = await apiClient.post(
        `/api/upload/clinic-asset`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setBranding(response.data.clinic);
      setFaviconFile(null);
      setFaviconPreview('');
      
      toast({
        title: 'Favicon uploaded',
        description: 'The clinic favicon has been uploaded successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast({
        title: 'Error uploading favicon',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  if (isLoading || !branding) {
    return (
      <Box p={4}>
        <Text>Loading branding settings...</Text>
      </Box>
    );
  }
  
  return (
    <Box p={4}>
      <Heading size="md" mb={6}>Clinic Branding & Customization</Heading>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        {/* Logo and Favicon Upload */}
        <GridItem>
          <Box bg={cardBg} borderRadius="md" p={4} shadow="md">
            <Heading size="sm" mb={4}>Logo & Favicon</Heading>
            
            <VStack spacing={6} align="start">
              {/* Logo Upload */}
              <Box w="100%">
                <FormLabel>Clinic Logo</FormLabel>
                <Flex direction={{ base: "column", sm: "row" }} gap={4} alignItems="center">
                  <Box 
                    w="100px" 
                    h="100px" 
                    border="1px solid" 
                    borderColor="gray.200" 
                    borderRadius="md"
                    overflow="hidden"
                    position="relative"
                  >
                    <Image 
                      src={logoPreview || branding.logoUrl || '/mediboo-logo.svg'} 
                      alt="Clinic Logo"
                      objectFit="contain"
                      w="full"
                      h="full"
                    />
                  </Box>
                  <VStack flex="1" align="start">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      size="sm"
                    />
                    <Button 
                      colorScheme="blue" 
                      leftIcon={<FiUpload />} 
                      size="sm"
                      isDisabled={!logoFile}
                      onClick={handleLogoUpload}
                    >
                      Upload Logo
                    </Button>
                  </VStack>
                </Flex>
                <Text fontSize="xs" mt={1} color="gray.500">
                  Recommended size: 200x200px, max 2MB
                </Text>
              </Box>
              
              {/* Favicon Upload */}
              <Box w="100%">
                <FormLabel>Favicon</FormLabel>
                <Flex direction={{ base: "column", sm: "row" }} gap={4} alignItems="center">
                  <Box 
                    w="64px" 
                    h="64px" 
                    border="1px solid" 
                    borderColor="gray.200" 
                    borderRadius="md"
                    overflow="hidden"
                    position="relative"
                  >
                    <Image 
                      src={faviconPreview || branding.faviconUrl || '/favicon.ico'} 
                      alt="Favicon"
                      objectFit="contain"
                      w="full"
                      h="full"
                    />
                  </Box>
                  <VStack flex="1" align="start">
                    <Input
                      type="file"
                      accept="image/x-icon,image/png,image/svg+xml"
                      onChange={handleFaviconChange}
                      size="sm"
                    />
                    <Button 
                      colorScheme="blue" 
                      leftIcon={<FiUpload />} 
                      size="sm"
                      isDisabled={!faviconFile}
                      onClick={handleFaviconUpload}
                    >
                      Upload Favicon
                    </Button>
                  </VStack>
                </Flex>
                <Text fontSize="xs" mt={1} color="gray.500">
                  Recommended size: 32x32px or 64x64px, max 1MB
                </Text>
              </Box>
            </VStack>
          </Box>
        </GridItem>
        
        {/* Preview */}
        <GridItem>
          <Box bg={cardBg} borderRadius="md" p={4} shadow="md" h="100%">
            <Heading size="sm" mb={4}>Preview</Heading>
            <Box 
              bg="white" 
              p={4} 
              borderRadius="md" 
              border="1px dashed"
              borderColor="gray.200"
              mb={4}
            >
              <ClinicLogo showName size="lg" />
            </Box>
            <Text fontSize="sm">
              This is how your branding will appear in the application. 
              Changes to colors and CSS may require refreshing the page to see the effect.
            </Text>
          </Box>
        </GridItem>
      </Grid>
      
      <Box mt={8} bg={cardBg} borderRadius="md" p={4} shadow="md">
        <Heading size="sm" mb={4}>Theme & Customization</Heading>
        
        <Formik
          initialValues={{
            primaryColor: branding.primaryColor || '#84c9ef',
            secondaryColor: branding.secondaryColor || '#b4d2ed',
            customDomain: branding.customDomain || '',
            customCss: branding.customCss || '',
          }}
          validationSchema={BrandingSchema}
          onSubmit={handleBrandingSubmit}
        >
          {(props) => (
            <Form>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <Field name="primaryColor">
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.primaryColor && form.touched.primaryColor} mb={4}>
                        <FormLabel>Primary Color</FormLabel>
                        <Flex>
                          <Input 
                            type="color" 
                            {...field} 
                            w="80px" 
                            borderRightRadius={0}
                          />
                          <Input 
                            {...field} 
                            borderLeftRadius={0}
                            flex={1}
                          />
                        </Flex>
                        <FormErrorMessage>{form.errors.primaryColor}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </GridItem>
                
                <GridItem>
                  <Field name="secondaryColor">
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.secondaryColor && form.touched.secondaryColor} mb={4}>
                        <FormLabel>Secondary Color</FormLabel>
                        <Flex>
                          <Input 
                            type="color" 
                            {...field} 
                            w="80px" 
                            borderRightRadius={0}
                          />
                          <Input 
                            {...field} 
                            borderLeftRadius={0}
                            flex={1}
                          />
                        </Flex>
                        <FormErrorMessage>{form.errors.secondaryColor}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </GridItem>
                
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Field name="customDomain">
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.customDomain && form.touched.customDomain} mb={4}>
                        <FormLabel>Custom Domain</FormLabel>
                        <Input {...field} placeholder="your-clinic.com" />
                        <FormErrorMessage>{form.errors.customDomain}</FormErrorMessage>
                        <Text fontSize="xs" mt={1} color="gray.500">
                          Optional: Enter your custom domain if you want to use it instead of the default subdomain
                        </Text>
                      </FormControl>
                    )}
                  </Field>
                </GridItem>
                
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Field name="customCss">
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.customCss && form.touched.customCss} mb={4}>
                        <FormLabel>Custom CSS</FormLabel>
                        <Textarea 
                          {...field} 
                          placeholder="/* Add your custom CSS here */\n.your-class { color: red; }" 
                          minH="200px"
                          fontFamily="monospace"
                        />
                        <FormErrorMessage>{form.errors.customCss}</FormErrorMessage>
                        <Text fontSize="xs" mt={1} color="gray.500">
                          Optional: Advanced users can add custom CSS to override the default styling
                        </Text>
                      </FormControl>
                    )}
                  </Field>
                </GridItem>
              </Grid>
              
              <Button
                mt={4}
                colorScheme="blue"
                isLoading={props.isSubmitting}
                type="submit"
                leftIcon={<FiSave />}
              >
                Save Branding Settings
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default BrandingManagement;
