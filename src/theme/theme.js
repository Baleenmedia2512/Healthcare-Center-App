import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#e9f5fd',
    100: '#84c9ef', // Primary brand color
    200: '#b4d2ed', // Secondary brand color
    300: '#cbbddd', // Tertiary brand color
    400: '#dcb5d4', // Accent color
    500: '#e3b1d2', // Light accent color
    600: '#68a1c0',
    700: '#4d7990',
    800: '#335160',
    900: '#1a2830',
  },
  secondary: {
    50: '#f0f7fd',
    100: '#d6e8f7',
    200: '#b4d2ed',
    300: '#90b6dd',
    400: '#6c9bce',
    500: '#5080be',
    600: '#406699',
    700: '#304d73',
    800: '#20334c',
    900: '#101a26',
  },
};

const fonts = {
  heading: '"Roboto", sans-serif',
  body: '"Open Sans", sans-serif',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'md',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        color: 'white',
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
        },
      }),
      outline: (props) => ({
        borderColor: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        color: props.colorScheme === 'brand' ? 'brand.500' : undefined,
      }),
    },
  },
  Card: {
    baseStyle: {
      p: '20px',
      borderRadius: 'lg',
      boxShadow: 'md',
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme;
