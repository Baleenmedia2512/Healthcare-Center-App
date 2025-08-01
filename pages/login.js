import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Login } from '@/components/Auth';
import { AUTH_CONFIG } from '@/config/index';
import { Box, Spinner, Center } from '@chakra-ui/react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (session && status === 'authenticated') {
      const redirectTo = router.query.callbackUrl || 
                        getDashboardRoute(session.user.role);
      router.push(redirectTo);
    }
  }, [session, status, router]);

  // Get dashboard route based on role
  const getDashboardRoute = (role) => {
    switch(role) {
      case 'superadmin':
        return '/saas-admin';
      case 'clinicadmin':
        return '/clinic-admin';
      case 'branchadmin':
        return '/branch-admin';
      case 'doctor':
        return '/doctor-dashboard';
      default:
        return '/doctor-dashboard';
    }
  };

  if (status === 'loading') {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (session) {
    return (
      <Center minH="100vh">
        <Box>Redirecting...</Box>
      </Center>
    );
  }

  return <Login />;
}
