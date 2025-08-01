import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import baseTheme from '@/theme/theme';
import { AuthProvider } from '@/lib/auth';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import Head from 'next/head';

/**
 * Dynamic Head component that has access to the theme context
 */
function DynamicHead() {
  const { clinicBranding } = useTheme();
  
  return (
    <Head>
      <title>{clinicBranding?.clinicName || 'MediBoo'}</title>
      {clinicBranding?.faviconUrl && (
        <link rel="icon" href={clinicBranding.faviconUrl} />
      )}
      {/* Add custom CSS variables for the clinic styling */}
      <style jsx global>{`
        :root {
          --clinic-primary-color: ${clinicBranding?.primaryColor || '#84c9ef'};
          --clinic-secondary-color: ${clinicBranding?.secondaryColor || '#b4d2ed'};
          ${clinicBranding?.customCss || ''}
        }
      `}</style>
    </Head>
  );
}

/**
 * App content that uses the theme context
 */
function AppContent({ Component, pageProps }) {
  const { theme: clinicTheme } = useTheme();
  
  return (
    <ChakraProvider theme={clinicTheme || baseTheme}>
      <DynamicHead />
      <AuthProvider>
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

/**
 * Main App component
 * Properly wraps the application with all required context providers
 */
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}
