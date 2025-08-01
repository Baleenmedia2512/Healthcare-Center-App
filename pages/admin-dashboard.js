import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth';
import { Spinner, Box, Text } from '@chakra-ui/react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to specific admin dashboard based on role
      switch (user.role) {
        case 'superadmin':
          router.replace('/saas-admin');
          break;
        case 'clinicadmin':
          router.replace('/clinic-admin');
          break;
        case 'branchadmin':
          router.replace('/branch-admin');
          break;
        case 'doctor':
          router.replace('/doctor-dashboard');
          break;
        default:
          router.replace('/login');
      }
    } else if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Show loading spinner while redirecting
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      height="100vh"
      flexDirection="column"
    >
      <Spinner size="xl" color="blue.500" />
      <Text mt={4} color="gray.600">Redirecting to your dashboard...</Text>
    </Box>
  );
}
