import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Card,
  CardHeader,
  CardBody,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  useColorModeValue,
  Spinner,
  Center,
  Flex,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FiLock } from 'react-icons/fi';
import { useAuth } from '../../lib/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { login, isAuthenticated, user, getDashboardByRole } = useAuth();
  
  // Get color values for the theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = router.query.callbackUrl || getDashboardByRole(user.role);
      router.push(from);
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, user, router, getDashboardByRole]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };
  
  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }
      
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      
      // Login successful - navigation is handled in the login function
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };
  
  // If checking authentication status, show loading spinner
  if (isCheckingAuth) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }
  
  return (
    <Flex 
      minH="100vh" 
      align="center" 
      justify="center" 
      bg={bgColor} 
      p={4}
    >
      <Card 
        w={{ base: '90%', sm: '400px' }}
        boxShadow="xl" 
        bg={cardBg}
        borderRadius="lg"
        overflow="hidden"
      >
        <CardHeader>
          <Center>
            <Heading size="lg" color="brand.500">
              MediBoo
            </Heading>
          </Center>
          <Text textAlign="center" color="gray.500" mt={2}>
            Sign in to your account
          </Text>
        </CardHeader>
        
        <CardBody>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      onClick={handleTogglePassword}
                      tabIndex="-1" // prevent tab focus
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                w="full"
                mt={6}
                isLoading={isLoading}
                loadingText="Signing in"
                leftIcon={<FiLock />}
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default Login;
