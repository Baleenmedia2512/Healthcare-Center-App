import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  useColorModeValue,
  Grid,
  GridItem,
  Divider,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Icon,
  Alert,
  AlertIcon,
  Checkbox,
} from '@chakra-ui/react';
import { FiSave, FiCheckCircle } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../../context/AppContext';

const PatientRegistration = () => {
  const toast = useToast();
  const router = useRouter();
  const { addPatient, isLoading, error } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [registeredPatientId, setRegisteredPatientId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [pendingPatientData, setPendingPatientData] = useState(null);

  // Helper functions for displaying selected options in confirmation modal
  const getSelectedConditions = (conditions) => {
    return Object.keys(conditions)
      .filter(key => key !== 'commonNotes' && conditions[key] === true)
      .map(key => key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'))
      .join(', ') || 'None selected';
  };

  const getPhysicalGeneralsText = (physicalGenerals) => {
    const entries = Object.entries(physicalGenerals)
      .filter(([key, value]) => value && value.trim() !== '')
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
    return entries.length > 0 ? entries.join(', ') : 'No information provided';
  };

  const getMenstrualHistoryText = (menstrualHistory) => {
    const entries = Object.entries(menstrualHistory)
      .filter(([key, value]) => value && value.trim() !== '' && value !== 'No')
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`);
    return entries.length > 0 ? entries.join(', ') : 'No specific details provided';
  };

  const getFoodAndHabitText = (foodAndHabit) => {
    const entries = Object.entries(foodAndHabit)
      .filter(([key, value]) => value && value.trim() !== '')
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`);
    return entries.length > 0 ? entries.join(', ') : 'No specific habits mentioned';
  };

  // Enhanced form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().trim().required('Patient name is required'),
    guardianName: Yup.string().trim(),
    address: Yup.string().trim().required('Address is required'),
    age: Yup.number()
      .typeError('Age must be a number')
      .required('Age is required')
      .positive('Age must be positive')
      .integer('Age must be a whole number'),
    sex: Yup.string().required('Sex is required'),
    occupation: Yup.string().trim(),
    mobileNumber: Yup.string()
      .trim()
      .matches(/^[0-9-+()\\s]+$/, 'Invalid phone number')
      .required('Mobile number is required'),
    chiefComplaints: Yup.string().trim().required('Chief complaints are required'),
    // New nested validations (lightweight)
    medicalHistory: Yup.object().shape({
      pastHistory: Yup.object(),
      familyHistory: Yup.object(),
    }),
    physicalGenerals: Yup.object(),
    menstrualHistory: Yup.mixed(),
    foodAndHabit: Yup.object(),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      name: '',
      guardianName: '',
      address: '',
      age: '',
      sex: '',
      occupation: '',
      mobileNumber: '',
      chiefComplaints: '',
      // New fields
      medicalHistory: {
        pastHistory: {
          allergy: false,
          commonNotes: '',
          anemia: false,
          arthritis: false,
          asthma: false,
          cancer: false,
          diabetes: false,
          heartDisease: false,
          hypertension: false,
          thyroid: false,
          tuberculosis: false,
        },
        familyHistory: {
          diabetes: false,
          hypertension: false,
          thyroid: false,
          tuberculosis: false,
          cancer: false,
        },
      },
      physicalGenerals: {
        appetite: '',
        bowel: '',
        urine: '',
        sweating: '',
        sleep: '',
        thirst: '',
        addictions: '',
      },
      menstrualHistory: {
        menses: '',
        menopause: 'No',
        leucorrhoea: '',
        gonorrhea: 'No',
        otherDischarges: '',
      },
      foodAndHabit: {
        foodHabit: '',
        addictions: '',
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Clear any previous errors
        setFormError(null);
        
        // Validate form manually to ensure all fields are correct
        await validationSchema.validate(values, { abortEarly: false });
        
        // Force trim values to ensure no whitespace issues
        values.mobileNumber = values.mobileNumber ? values.mobileNumber.trim() : '';
        values.chiefComplaints = values.chiefComplaints ? values.chiefComplaints.trim() : '';
        
        // Extra validation for the fields that are failing
        if (!values.mobileNumber) {
          throw new Error('Mobile number is required');
        }
        
        if (!values.chiefComplaints) {
          throw new Error('Chief complaints are required');
        }
        
        // Create a data object with explicit formatting
        const newPatientData = {
          name: values.name.trim(),
          guardianName: values.guardianName?.trim() || null,
          address: values.address.trim(),
          age: parseInt(values.age),
          sex: values.sex,
          occupation: values.occupation?.trim() || '',
          
          // CRITICAL FIX: Ensure these fields are explicitly set with string values
          mobileNumber: String(values.mobileNumber), // Force string type
          chiefComplaints: String(values.chiefComplaints), // Force string type
          
          // Use values from form (fall back to defaults where necessary)
          medicalHistory: values.medicalHistory || {
            pastHistory: {},
            familyHistory: {},
          },
          physicalGenerals: values.physicalGenerals || {
            appetite: '',
            bowel: '',
            urine: '',
            sweating: '',
            sleep: '',
            thirst: '',
            addictions: '',
          },
          menstrualHistory: values.sex === 'Female' ? (values.menstrualHistory || {
            menses: '',
            menopause: 'No',
            leucorrhoea: '',
            gonorrhea: 'No',
            otherDischarges: '',
          }) : null,
          foodAndHabit: values.foodAndHabit || {
            foodHabit: '',
            addictions: '',
          }
        };

        // Store the patient data and show confirmation modal
        setPendingPatientData(newPatientData);
        onConfirmOpen();
        
      } catch (error) {
        console.error("Form validation error:", error);
        // Enhanced error handling
        let errorMessage = 'Form validation failed';
        let errorDetails = '';
        
        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
          errorDetails = error.response.data?.details || '';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Set form error for display
        setFormError(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
        
        toast({
          title: 'Validation failed',
          description: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  // Function to handle actual patient registration after confirmation
  const handleConfirmRegistration = async () => {
    try {
      console.log('Submitting patient data:', pendingPatientData);
      console.log('Critical fields check:', {
        mobileNumber: pendingPatientData.mobileNumber,
        chiefComplaints: pendingPatientData.chiefComplaints,
        mobileNumberType: typeof pendingPatientData.mobileNumber,
        chiefComplaintsType: typeof pendingPatientData.chiefComplaints,
        mobileNumberLength: pendingPatientData.mobileNumber.length,
        chiefComplaintsLength: pendingPatientData.chiefComplaints.length
      });

      // Add the patient to the context
      const result = await addPatient(pendingPatientData);
      setRegisteredPatientId(result.id);
      
      // Close confirmation modal and open success modal
      onConfirmClose();
      
      // Show success message
      toast({
        title: 'Patient registered successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onOpen(); // Open the success modal
    } catch (error) {
      console.error("Error registering patient:", error);
      // Enhanced error handling
      let errorMessage = 'Could not register patient';
      let errorDetails = '';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        errorDetails = error.response.data?.details || '';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('Registration error details:', {
        message: errorMessage,
        details: errorDetails,
        response: error.response?.data
      });
      
      // Close confirmation modal
      onConfirmClose();
      
      // Set form error for display
      setFormError(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
      
      toast({
        title: 'Registration failed',
        description: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Navigate to the patient's detail page or register another patient
  const handleNavigate = (path) => {
    onClose();
    router.push(path);
  };

  return (
    <Box>
      <Heading size="lg" mb="6">Patient Registration</Heading>
      
      <Card>
        <CardHeader bg={useColorModeValue('brand.50', 'gray.700')} py="3">
          <Heading size="md" color={useColorModeValue('gray.700', 'gray.100')}>Patient & Case Record</Heading>
        </CardHeader>
        <CardBody>
          <Alert status="info" mb={4} bg={useColorModeValue('blue.50', 'blue.900')} color={useColorModeValue('blue.800', 'blue.100')}>
            <AlertIcon color={useColorModeValue('blue.500', 'blue.200')} />
            <Box>
              <Text fontWeight="bold">Form Instructions</Text>
              <Text fontSize="sm">
                All fields marked with * are required. Make sure to fill in the Mobile Number and Chief Complaints fields.
              </Text>
            </Box>
          </Alert>
          <form onSubmit={formik.handleSubmit} noValidate>
            <VStack spacing="6" align="stretch">
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <FormControl isInvalid={formik.touched.name && formik.errors.name}>
                    <FormLabel>Patient Name <Text as="span" color="red.500">*</Text></FormLabel>
                    <Input 
                      name="name" 
                      placeholder="Enter patient's full name" 
                      {...formik.getFieldProps('name')}
                    />
                    <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl>
                    <FormLabel>Guardian Name</FormLabel>
                    <Input 
                      name="guardianName" 
                      placeholder="Enter guardian's name (if applicable)" 
                      {...formik.getFieldProps('guardianName')}
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isInvalid={formik.touched.address && formik.errors.address}>
                    <FormLabel>Address <Text as="span" color="red.500">*</Text></FormLabel>
                    <Textarea 
                      name="address" 
                      placeholder="Enter complete address" 
                      rows={3}
                      {...formik.getFieldProps('address')}
                    />
                    <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={formik.touched.age && formik.errors.age}>
                    <FormLabel>Age <Text as="span" color="red.500">*</Text></FormLabel>
                    <Input 
                      name="age" 
                      type="number" 
                      placeholder="Age in years"
                      {...formik.getFieldProps('age')}
                    />
                    <FormErrorMessage>{formik.errors.age}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={formik.touched.sex && formik.errors.sex}>
                    <FormLabel>Sex <Text as="span" color="red.500">*</Text></FormLabel>
                    <Select 
                      name="sex" 
                      placeholder="Select sex"
                      {...formik.getFieldProps('sex')}
                      aria-required="true"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                    <FormErrorMessage>{formik.errors.sex}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>Occupation</FormLabel>
                    <Input 
                      name="occupation" 
                      placeholder="Patient's occupation"
                      {...formik.getFieldProps('occupation')}
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl 
                    isInvalid={formik.touched.mobileNumber && formik.errors.mobileNumber}
                  >
                    <FormLabel>Mobile Number <Text as="span" color="red.500">*</Text></FormLabel>
                    <Input 
                      name="mobileNumber" 
                      placeholder="Enter contact number"
                      value={formik.values.mobileNumber}
                      onChange={(e) => {
                        // Direct validation before setting value
                        const value = e.target.value;
                        if (value && value.trim() !== '') {
                          formik.setFieldValue('mobileNumber', value);
                        } else {
                          // Don't allow empty values
                          formik.setFieldValue('mobileNumber', value, false);
                          formik.setFieldError('mobileNumber', 'Mobile number is required');
                        }
                      }}
                      onBlur={formik.handleBlur}
                      aria-required="true"
                      required
                    />
                    <FormErrorMessage>{formik.errors.mobileNumber}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Divider my="2" />
                  <FormControl 
                    isInvalid={formik.touched.chiefComplaints && formik.errors.chiefComplaints}
                  >
                    <FormLabel>Chief Complaints <Text as="span" color="red.500">*</Text></FormLabel>
                    <Textarea 
                      name="chiefComplaints" 
                      placeholder="Describe the main symptoms or complaints"
                      rows={4}
                      value={formik.values.chiefComplaints}
                      onChange={(e) => {
                        // Direct validation before setting value
                        const value = e.target.value;
                        if (value && value.trim() !== '') {
                          formik.setFieldValue('chiefComplaints', value);
                        } else {
                          // Don't allow empty values
                          formik.setFieldValue('chiefComplaints', value, false);
                          formik.setFieldError('chiefComplaints', 'Chief complaints are required');
                        }
                      }}
                      onBlur={formik.handleBlur}
                      aria-required="true"
                      required
                    />
                    <FormErrorMessage>{formik.errors.chiefComplaints}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Medical History Sections */}
              <Box mt={6}>
                <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>
                  Medical History & Additional Information
                </Heading>
                <Accordion allowMultiple defaultIndex={[]} variant="outline">
                  {/* Past Medical History */}
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        Past Medical History
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={3}>
                        Select any conditions the patient has had in the past:
                      </Text>
                      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }} gap={3}>
                        {Object.keys(formik.values.medicalHistory.pastHistory)
                          .filter(key => key !== 'commonNotes')
                          .map((key) => (
                          <Checkbox
                            key={key}
                            isChecked={formik.values.medicalHistory.pastHistory[key]}
                            onChange={(e) => {
                              formik.setFieldValue(`medicalHistory.pastHistory.${key}`, e.target.checked);
                            }}
                            colorScheme="brand"
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </Checkbox>
                        ))}
                      </Grid>
                      <FormControl mt={4}>
                        <FormLabel fontSize="sm">Additional Notes</FormLabel>
                        <Textarea
                          placeholder="Any additional past medical history details..."
                          size="sm"
                          rows={3}
                          {...formik.getFieldProps('medicalHistory.pastHistory.commonNotes')}
                        />
                      </FormControl>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Family History */}
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        Family History
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={3}>
                        Select any conditions that run in the patient's family:
                      </Text>
                      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
                        {Object.keys(formik.values.medicalHistory.familyHistory).map((key) => (
                          <Checkbox
                            key={key}
                            isChecked={formik.values.medicalHistory.familyHistory[key]}
                            onChange={(e) => formik.setFieldValue(`medicalHistory.familyHistory.${key}`, e.target.checked)}
                            colorScheme="brand"
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </Checkbox>
                        ))}
                      </Grid>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Physical Generals */}
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        Physical Generals
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={3}>
                        General physical and lifestyle information:
                      </Text>
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                        <FormControl>
                          <FormLabel fontSize="sm">Appetite</FormLabel>
                          <Input 
                            placeholder="e.g., Good, Poor, Variable"
                            {...formik.getFieldProps('physicalGenerals.appetite')} 
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Bowel Movement</FormLabel>
                          <Input 
                            placeholder="e.g., Regular, Constipated"
                            {...formik.getFieldProps('physicalGenerals.bowel')} 
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Urine</FormLabel>
                          <Input 
                            placeholder="e.g., Normal, Frequent"
                            {...formik.getFieldProps('physicalGenerals.urine')} 
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Sweating</FormLabel>
                          <Input 
                            placeholder="e.g., Normal, Excessive"
                            {...formik.getFieldProps('physicalGenerals.sweating')} 
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Sleep Pattern</FormLabel>
                          <Input 
                            placeholder="e.g., Good, Disturbed"
                            {...formik.getFieldProps('physicalGenerals.sleep')} 
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Thirst</FormLabel>
                          <Input 
                            placeholder="e.g., Normal, Excessive"
                            {...formik.getFieldProps('physicalGenerals.thirst')} 
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Addictions</FormLabel>
                          <Input 
                            placeholder="e.g., Smoking, Alcohol, None"
                            {...formik.getFieldProps('physicalGenerals.addictions')} 
                          />
                        </FormControl>
                      </Grid>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Menstrual History - Only for females */}
                  {formik.values.sex === 'Female' && (
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="semibold">
                          Menstrual History
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={3}>
                          Menstrual and gynecological history:
                        </Text>
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">Menses Details</FormLabel>
                            <Input 
                              placeholder="e.g., Regular 28-day cycle"
                              {...formik.getFieldProps('menstrualHistory.menses')} 
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Menopause</FormLabel>
                            <Select {...formik.getFieldProps('menstrualHistory.menopause')}>
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Leucorrhoea</FormLabel>
                            <Input 
                              placeholder="Any unusual discharge"
                              {...formik.getFieldProps('menstrualHistory.leucorrhoea')} 
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Gonorrhea</FormLabel>
                            <Select {...formik.getFieldProps('menstrualHistory.gonorrhea')}>
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </Select>
                          </FormControl>
                          <FormControl colSpan={{ base: 1, md: 2 }}>
                            <FormLabel fontSize="sm">Other Discharges</FormLabel>
                            <Input 
                              placeholder="Any other vaginal discharges or issues"
                              {...formik.getFieldProps('menstrualHistory.otherDischarges')} 
                            />
                          </FormControl>
                        </Grid>
                      </AccordionPanel>
                    </AccordionItem>
                  )}

                  {/* Food & Habit */}
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        Food & Habit
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={3}>
                        Dietary habits and lifestyle information:
                      </Text>
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <FormControl>
                          <FormLabel fontSize="sm">Food Habits</FormLabel>
                          <Input 
                            placeholder="e.g., Vegetarian, Non-vegetarian, Vegan"
                            {...formik.getFieldProps('foodAndHabit.foodHabit')} 
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">Addictions/Habits</FormLabel>
                          <Input 
                            placeholder="e.g., Tea, Coffee, Tobacco, Alcohol"
                            {...formik.getFieldProps('foodAndHabit.addictions')} 
                          />
                        </FormControl>
                      </Grid>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Box>

              {(error || formError) && (
                <Alert status="error" mt={4} mb={2}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Error: {error || formError}</Text>
                    {formik.status && <Text mt={1}>{formik.status}</Text>}
                  </Box>
                </Alert>
              )}
              
              {/* Form validation summary */}
              {formik.touched.name && Object.keys(formik.errors).length > 0 && (
                <Alert status="warning" mt={4} mb={2}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Please fix the following errors:</Text>
                    <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                      {Object.entries(formik.errors).map(([field, error]) => (
                        <li key={field}>{error}</li>
                      ))}
                    </ul>
                  </Box>
                </Alert>
              )}
              
              <HStack justify="flex-end" pt="4" spacing={4}>
                {/* Debug button to manually check form values */}
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Current form values:', formik.values);
                    console.log('Form validation status:', {
                      isValid: formik.isValid,
                      errors: formik.errors,
                      touched: formik.touched
                    });
                    alert('Form values logged to console for debugging');
                  }}
                >
                  Debug Form
                </Button>
                <Button 
                  type="submit" 
                  colorScheme="brand" 
                  leftIcon={<FiSave />} 
                  isLoading={formik.isSubmitting}
                >
                  Preview & Register Patient
                </Button>
              </HStack>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={useColorModeValue('white', 'gray.800')} maxH="90vh">
          <ModalHeader bg={useColorModeValue('blue.50', 'blue.900')} color={useColorModeValue('blue.700', 'blue.200')}>
            Confirm Patient Registration
          </ModalHeader>
          <ModalCloseButton color={useColorModeValue('gray.700', 'gray.200')} />
          <ModalBody py="6" overflowY="auto" maxH="calc(90vh - 120px)">
            <Text mb={4} color={useColorModeValue('gray.600', 'gray.400')}>
              Please review the patient details before confirming registration:
            </Text>
            
            {pendingPatientData && (
              <VStack spacing="4" align="stretch">
                <Box p={4} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Heading size="sm" mb={3} color={useColorModeValue('gray.700', 'gray.200')}>
                    Basic Information
                  </Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={3} fontSize="sm">
                    <Box>
                      <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')}>Patient Name:</Text>
                      <Text color={useColorModeValue('gray.800', 'gray.100')}>{pendingPatientData.name}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')}>Guardian Name:</Text>
                      <Text color={useColorModeValue('gray.800', 'gray.100')}>{pendingPatientData.guardianName || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')}>Age:</Text>
                      <Text color={useColorModeValue('gray.800', 'gray.100')}>{pendingPatientData.age} years</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')}>Sex:</Text>
                      <Text color={useColorModeValue('gray.800', 'gray.100')}>{pendingPatientData.sex}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')}>Occupation:</Text>
                      <Text color={useColorModeValue('gray.800', 'gray.100')}>{pendingPatientData.occupation || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')}>Mobile Number:</Text>
                      <Text color={useColorModeValue('gray.800', 'gray.100')}>{pendingPatientData.mobileNumber}</Text>
                    </Box>
                  </Grid>
                  {/* Medical History - Non-editable summary */}
                  <Accordion allowMultiple defaultIndex={[0]} variant="outline">
                    <AccordionItem>
                      <AccordionButton px={0} py={2}>
                        <Box flex="1" textAlign="left" fontWeight="semibold">Medical History (Past)</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} px={0}>
                        <Text fontSize="sm" color={useColorModeValue('gray.800', 'gray.100')}>
                          {getSelectedConditions(formik.values.medicalHistory.pastHistory)}
                        </Text>
                        {formik.values.medicalHistory.pastHistory.commonNotes && (
                          <Box mt={2}>
                            <Text fontSize="xs" fontWeight="semibold" color={useColorModeValue('gray.600', 'gray.400')}>
                              Additional Notes:
                            </Text>
                            <Text fontSize="sm" color={useColorModeValue('gray.800', 'gray.100')}>
                              {formik.values.medicalHistory.pastHistory.commonNotes}
                            </Text>
                          </Box>
                        )}
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton px={0} py={2}>
                        <Box flex="1" textAlign="left" fontWeight="semibold">Family History</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} px={0}>
                        <Text fontSize="sm" color={useColorModeValue('gray.800', 'gray.100')}>
                          {getSelectedConditions(formik.values.medicalHistory.familyHistory)}
                        </Text>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton px={0} py={2}>
                        <Box flex="1" textAlign="left" fontWeight="semibold">Physical Generals</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} px={0}>
                        <Text fontSize="sm" color={useColorModeValue('gray.800', 'gray.100')}>
                          {getPhysicalGeneralsText(formik.values.physicalGenerals)}
                        </Text>
                      </AccordionPanel>
                    </AccordionItem>

                    {formik.values.sex === 'Female' && (
                      <AccordionItem>
                        <AccordionButton px={0} py={2}>
                          <Box flex="1" textAlign="left" fontWeight="semibold">Menstrual History</Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} px={0}>
                          <Text fontSize="sm" color={useColorModeValue('gray.800', 'gray.100')}>
                            {getMenstrualHistoryText(formik.values.menstrualHistory)}
                          </Text>
                        </AccordionPanel>
                      </AccordionItem>
                    )}

                    <AccordionItem>
                      <AccordionButton px={0} py={2}>
                        <Box flex="1" textAlign="left" fontWeight="semibold">Food & Habit</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4} px={0}>
                        <Text fontSize="sm" color={useColorModeValue('gray.800', 'gray.100')}>
                          {getFoodAndHabitText(formik.values.foodAndHabit)}
                        </Text>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Box>
                
                <Box p={4} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>Address:</Text>
                  <Text color={useColorModeValue('gray.800', 'gray.100')} fontSize="sm">{pendingPatientData.address}</Text>
                </Box>
                
                <Box p={4} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Text fontWeight="bold" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>Chief Complaints:</Text>
                  <Text color={useColorModeValue('gray.800', 'gray.100')} fontSize="sm">{pendingPatientData.chiefComplaints}</Text>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={onConfirmClose}
              color={useColorModeValue('gray.800', 'gray.100')}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={handleConfirmRegistration}
              isLoading={isLoading}
              leftIcon={<FiSave />}
            >
              Confirm & Register
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={useColorModeValue('white', 'gray.800')}>
          <ModalHeader bg={useColorModeValue('green.50', 'green.900')} color={useColorModeValue('green.700', 'green.200')}>
            Registration Successful
          </ModalHeader>
          <ModalCloseButton color={useColorModeValue('gray.700', 'gray.200')} />
          <ModalBody py="6">
            <VStack spacing="4">
              <Icon as={FiCheckCircle} color={useColorModeValue('green.500', 'green.300')} boxSize="12" />
              <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('gray.800', 'gray.100')}>
                Patient has been registered successfully
              </Text>
              <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
                What would you like to do next?
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => {
                formik.resetForm();
                onClose();
              }}
              color={useColorModeValue('gray.800', 'gray.100')}
            >
              Register Another Patient
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={() => handleNavigate(`/patient/${registeredPatientId}`)}
            >
              View Patient Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientRegistration;
