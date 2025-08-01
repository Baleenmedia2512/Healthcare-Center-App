import React from 'react';
import Image from 'next/image';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import { getDefaultLogoUrl } from '@/utils/localFileStorage';

/**
 * ClinicLogo Component
 * Displays the logo for the current clinic or a default one
 */
const ClinicLogo = ({ 
  showName = true, 
  size = 'md', 
  variant = 'horizontal',
  ...props
}) => {
  const { data: session } = useSession();
  const { clinicBranding } = useTheme();
  
  // Determine logo dimensions based on size
  const dimensions = {
    sm: { height: 30, width: 30 },
    md: { height: 40, width: 40 },
    lg: { height: 60, width: 60 },
    xl: { height: 80, width: 80 }
  };
  
  const { height, width } = dimensions[size] || dimensions.md;
  
  // Get the appropriate logo URL
  const logoUrl = clinicBranding?.logoUrl || getDefaultLogoUrl();
  const clinicName = session?.user?.clinicName || clinicBranding?.clinicName || 'MediBoo';
  
  // Horizontal variant (logo and text side by side)
  if (variant === 'horizontal') {
    return (
      <Box display="flex" alignItems="center" {...props}>
        <Box 
          position="relative" 
          height={`${height}px`} 
          width={`${width}px`}
          overflow="hidden"
        >
          <Image
            src={logoUrl}
            alt={`${clinicName} logo`}
            fill
            style={{
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            priority
          />
        </Box>
        
        {showName && (
          <Box ml={3}>
            <Heading 
              size={size === 'xl' ? 'md' : (size === 'lg' ? 'sm' : 'xs')}
              bgGradient="linear(to-r, brand.100, brand.300, brand.400)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
            >
              {clinicName}
            </Heading>
          </Box>
        )}
      </Box>
    );
  }
  
  // Vertical variant (logo above text)
  return (
    <Box display="flex" flexDirection="column" alignItems="center" {...props}>
      <Box 
        position="relative" 
        height={`${height}px`} 
        width={`${width}px`}
        overflow="hidden"
        mb={2}
      >
        <Image
          src={logoUrl}
          alt={`${clinicName} logo`}
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'center'
          }}
          priority
        />
      </Box>
      
      {showName && (
        <Box textAlign="center">
          <Heading 
            size={size === 'xl' ? 'md' : (size === 'lg' ? 'sm' : 'xs')}
            bgGradient="linear(to-r, brand.100, brand.300, brand.400)"
            bgClip="text"
            fontWeight="extrabold"
            letterSpacing="tight"
          >
            {clinicName}
          </Heading>
        </Box>
      )}
    </Box>
  );
};

export default ClinicLogo;
