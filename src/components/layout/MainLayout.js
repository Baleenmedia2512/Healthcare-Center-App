/**
 * Main Layout Component
 * 
 * Provides the main layout structure for authenticated pages
 */

import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  VStack,
  HStack,
  Heading,
  useDisclosure,
  CloseButton,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useBreakpointValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiSearch,
  FiSettings,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiBarChart2,
  FiPlusCircle,
  FiFileText,
} from 'react-icons/fi';
import { useAuth } from '../../lib/auth';
import { APP_CONFIG, AUTH_CONFIG } from '../../config';

// Import the dynamic clinic logo
import ClinicLogo from '../common/ClinicLogo';

// Navigation items with role-based access
const getNavItems = (userRole) => {
  // Admin-only navigation for different admin levels
  if (userRole === AUTH_CONFIG.roles.SUPERADMIN) {
    return [
      { 
        name: 'SaaS Admin Dashboard', 
        icon: <FiHome />, 
        href: '/saas-admin' 
      },
    ];
  }

  if (userRole === AUTH_CONFIG.roles.CLINICADMIN) {
    return [
      { 
        name: 'Clinic Admin Dashboard', 
        icon: <FiHome />, 
        href: '/clinic-admin' 
      },
    ];
  }

  if (userRole === AUTH_CONFIG.roles.BRANCHADMIN) {
    return [
      { 
        name: 'Branch Admin Dashboard', 
        icon: <FiHome />, 
        href: '/branch-admin' 
      },
    ];
  }

  // Doctor navigation - full access to core modules
  const doctorItems = [
    { 
      name: 'Dashboard', 
      icon: <FiHome />, 
      href: '/doctor-dashboard' 
    },
    { 
      name: 'Patients', 
      icon: <FiUsers />, 
      href: '/patients' 
    },
    { 
      name: 'Reports', 
      icon: <FiFileText />, 
      href: '/reports' 
    },
    { 
      name: 'Search', 
      icon: <FiSearch />, 
      href: '/search' 
    },
    { 
      name: 'Settings', 
      icon: <FiSettings />, 
      href: '/settings' 
    },
  ];

  return doctorItems;
};

// Navigation Item Component
const NavItem = ({ icon, href, children, badge, isActive }) => {
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('gray.200', 'gray.600');

  return (
    <Link href={href} passHref style={{ textDecoration: 'none', width: '100%' }}>
      <Flex
        align="center"
        p="3"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : 'inherit'}
        fontWeight={isActive ? 'semibold' : 'normal'}
        _hover={{
          bg: hoverBg,
        }}
      >
        {icon && (
          <Box mr="4" fontSize="16">
            {icon}
          </Box>
        )}
        {children}
        {badge && (
          <Badge ml="auto" colorScheme={badge.colorScheme} variant="solid">
            {badge.text}
          </Badge>
        )}
      </Flex>
    </Link>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, onClose, user }) => {
  const router = useRouter();
  
  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <ClinicLogo p="4" />
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      
      <VStack spacing={1} align="stretch">
        {getNavItems(user?.role).map((item) => (
          <NavItem 
            key={item.name} 
            icon={item.icon} 
            href={item.href} 
            badge={item.badge}
            isActive={router.pathname === item.href}
          >
            {item.name}
          </NavItem>
        ))}
      </VStack>
    </Box>
  );
};

// Mobile Nav Component
const MobileNav = ({ onOpen, user, logout }) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.800')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />
      
      <Box display={{ base: 'flex', md: 'none' }}>
        <ClinicLogo p="4" size="sm" />
      </Box>

      <HStack spacing={3}>
        <Menu>
          <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
            <HStack>
              <Avatar
                size={'sm'}
                name={user?.name}
                src={user?.image}
                bg="brand.500"
              />
              <VStack
                display={{ base: 'none', md: 'flex' }}
                alignItems="flex-start"
                spacing="1px"
                ml="2"
              >
                <Text fontSize="sm">{user?.name || user?.email}</Text>
                <Text fontSize="xs" color="gray.600">
                  {user?.role}
                </Text>
              </VStack>
              <Box display={{ base: 'none', md: 'flex' }}>
                <FiChevronDown />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <MenuItem icon={<FiUser />}>Profile</MenuItem>
            <MenuItem icon={<FiSettings />}>Settings</MenuItem>
            <MenuItem icon={<FiLogOut />} onClick={logout}>Sign out</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

// Main Layout Component
const MainLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  
  // Use drawer on small screens, sidebar for larger screens
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {isMobile ? (
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <ClinicLogo size="md" />
            </DrawerHeader>
            <DrawerBody p={0}>
              <VStack spacing={1} align="stretch">
                {getNavItems(user?.role).map((item) => (
                  <NavItem 
                    key={item.name} 
                    icon={item.icon} 
                    href={item.href} 
                    badge={item.badge}
                    onClick={onClose}
                  >
                    {item.name}
                  </NavItem>
                ))}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sidebar isOpen={isOpen} onClose={onClose} user={user} />
      )}
      
      <Box ml={{ base: 0, md: 60 }} p="4">
        <MobileNav onOpen={onOpen} user={user} logout={logout} />
        <Box mt="4">{children}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
