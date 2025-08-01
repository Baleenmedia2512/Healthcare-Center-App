import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <Flex
      minH="70vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Box
        p={8}
        maxW="lg"
        textAlign="center"
        bg={useColorModeValue('white', 'gray.700')}
        boxShadow="lg"
        rounded="md"
      >
        <Heading as="h2" size="xl" mb={4}>
          404 - Page Not Found
        </Heading>
        <Text fontSize="lg" mb={6} color="gray.600">
          The page you're looking for does not exist or has been moved.
        </Text>
        <Link href="/" passHref>
          <Button
            leftIcon={<FiHome />}
            colorScheme="brand"
            as="a"
            size="lg"
          >
            Go Home
          </Button>
        </Link>
      </Box>
    </Flex>
  );
};

export default NotFound;
