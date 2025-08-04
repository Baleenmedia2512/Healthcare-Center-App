import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  Icon,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiAlertTriangle, FiTrash2, FiInfo } from 'react-icons/fi';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
  isLoading = false,
  ...props
}) => {
  const cancelRef = React.useRef();
  
  // Color scheme based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: FiTrash2,
          iconColor: 'red.500',
          confirmColorScheme: 'red',
          iconBg: useColorModeValue('red.50', 'red.900'),
        };
      case 'warning':
        return {
          icon: FiAlertTriangle,
          iconColor: 'orange.500',
          confirmColorScheme: 'orange',
          iconBg: useColorModeValue('orange.50', 'orange.900'),
        };
      case 'info':
        return {
          icon: FiInfo,
          iconColor: 'blue.500',
          confirmColorScheme: 'blue',
          iconBg: useColorModeValue('blue.50', 'blue.900'),
        };
      default:
        return {
          icon: FiAlertTriangle,
          iconColor: 'red.500',
          confirmColorScheme: 'red',
          iconBg: useColorModeValue('red.50', 'red.900'),
        };
    }
  };

  const styles = getVariantStyles();
  const headerBg = useColorModeValue('white', 'gray.800');
  const bodyBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
      {...props}
    >
      <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
        <AlertDialogContent
          mx={4}
          borderRadius="xl"
          boxShadow="2xl"
          border="1px"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          overflow="hidden"
        >
          {/* Header with icon */}
          <AlertDialogHeader
            bg={headerBg}
            p={6}
            pb={4}
            borderBottom="1px"
            borderColor={useColorModeValue('gray.100', 'gray.600')}
          >
            <VStack spacing={3} align="center">
              <Icon
                as={styles.icon}
                w={12}
                h={12}
                color={styles.iconColor}
                bg={styles.iconBg}
                p={3}
                borderRadius="full"
              />
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={useColorModeValue('gray.900', 'white')}
                textAlign="center"
              >
                {title}
              </Text>
            </VStack>
          </AlertDialogHeader>

          {/* Body */}
          <AlertDialogBody
            bg={bodyBg}
            p={6}
            textAlign="center"
          >
            <Text
              color={useColorModeValue('gray.600', 'gray.300')}
              fontSize="md"
              lineHeight="tall"
            >
              {message}
            </Text>
          </AlertDialogBody>

          {/* Footer */}
          <AlertDialogFooter
            bg={headerBg}
            p={6}
            pt={4}
            gap={3}
            justifyContent="center"
            borderTop="1px"
            borderColor={useColorModeValue('gray.100', 'gray.600')}
          >
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="ghost"
              colorScheme="gray"
              size="md"
              minW="100px"
              borderRadius="lg"
              fontWeight="medium"
            >
              {cancelText}
            </Button>
            <Button
              colorScheme={styles.confirmColorScheme}
              onClick={onConfirm}
              size="md"
              minW="100px"
              borderRadius="lg"
              fontWeight="medium"
              isLoading={isLoading}
              loadingText="Processing..."
            >
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
