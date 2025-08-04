import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // More vibrant pink for better clickability
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
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
      transition: 'all 0.2s cubic-bezier(.08,.52,.52,1)',
      _focus: {
        boxShadow: 'outline',
      },
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : 
            props.colorScheme === 'blue' ? 'blue.500' : undefined,
        color: 'white',
        boxShadow: props.colorScheme === 'brand' ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 
                   props.colorScheme === 'blue' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : 
              props.colorScheme === 'blue' ? 'blue.600' : undefined,
          transform: 'translateY(-2px)',
          boxShadow: props.colorScheme === 'brand' ? '0 6px 20px rgba(236, 72, 153, 0.4)' : 
                     props.colorScheme === 'blue' ? '0 6px 20px rgba(59, 130, 246, 0.4)' : undefined,
          _disabled: {
            transform: 'none',
            boxShadow: 'none',
          },
        },
        _active: {
          bg: props.colorScheme === 'brand' ? 'brand.700' : 
              props.colorScheme === 'blue' ? 'blue.700' : undefined,
          transform: 'translateY(0)',
          boxShadow: props.colorScheme === 'brand' ? '0 2px 8px rgba(236, 72, 153, 0.3)' : 
                     props.colorScheme === 'blue' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : undefined,
        },
        _disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
          transform: 'none',
          boxShadow: 'none',
        },
      }),
      outline: (props) => ({
        borderColor: props.colorScheme === 'brand' ? 'brand.500' : 
                     props.colorScheme === 'blue' ? 'blue.500' : undefined,
        color: props.colorScheme === 'brand' ? 'brand.500' : 
               props.colorScheme === 'blue' ? 'blue.500' : undefined,
        borderWidth: '2px',
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.50' : 
              props.colorScheme === 'blue' ? 'blue.50' : undefined,
          borderColor: props.colorScheme === 'brand' ? 'brand.600' : 
                       props.colorScheme === 'blue' ? 'blue.600' : undefined,
          transform: 'translateY(-1px)',
          boxShadow: props.colorScheme === 'brand' ? '0 4px 12px rgba(236, 72, 153, 0.2)' : 
                     props.colorScheme === 'blue' ? '0 4px 12px rgba(59, 130, 246, 0.2)' : undefined,
        },
        _active: {
          bg: props.colorScheme === 'brand' ? 'brand.100' : 
              props.colorScheme === 'blue' ? 'blue.100' : undefined,
          transform: 'translateY(0)',
        },
      }),
      ghost: (props) => ({
        color: props.colorScheme === 'brand' ? 'brand.500' : 
               props.colorScheme === 'blue' ? 'blue.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.50' : 
              props.colorScheme === 'blue' ? 'blue.50' : undefined,
          color: props.colorScheme === 'brand' ? 'brand.600' : 
                 props.colorScheme === 'blue' ? 'blue.600' : undefined,
        },
        _active: {
          bg: props.colorScheme === 'brand' ? 'brand.100' : 
              props.colorScheme === 'blue' ? 'blue.100' : undefined,
        },
      }),
    },
  },
  IconButton: {
    baseStyle: {
      transition: 'all 0.2s cubic-bezier(.08,.52,.52,1)',
      _focus: {
        boxShadow: 'outline',
      },
    },
    variants: {
      outline: (props) => ({
        borderWidth: '1px',
        borderColor: props.colorScheme ? `${props.colorScheme}.500` : 'gray.300',
        color: props.colorScheme ? `${props.colorScheme}.500` : 'gray.600',
        _hover: {
          bg: props.colorScheme ? `${props.colorScheme}.50` : 'gray.50',
          borderColor: props.colorScheme ? `${props.colorScheme}.600` : 'gray.400',
          transform: 'translateY(-1px)',
          boxShadow: props.colorScheme ? `0 2px 8px rgba(0, 0, 0, 0.1)` : '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        _active: {
          bg: props.colorScheme ? `${props.colorScheme}.100` : 'gray.100',
          transform: 'translateY(0)',
        },
      }),
      solid: (props) => ({
        bg: props.colorScheme ? `${props.colorScheme}.500` : 'gray.500',
        color: 'white',
        _hover: {
          bg: props.colorScheme ? `${props.colorScheme}.600` : 'gray.600',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
        _active: {
          bg: props.colorScheme ? `${props.colorScheme}.700` : 'gray.700',
          transform: 'translateY(0)',
        },
      }),
      ghost: (props) => ({
        color: props.colorScheme ? `${props.colorScheme}.500` : 'gray.600',
        _hover: {
          bg: props.colorScheme ? `${props.colorScheme}.50` : 'gray.50',
          color: props.colorScheme ? `${props.colorScheme}.600` : 'gray.700',
          transform: 'translateY(-1px)',
        },
        _active: {
          bg: props.colorScheme ? `${props.colorScheme}.100` : 'gray.100',
          transform: 'translateY(0)',
        },
      }),
    },
  },
  Table: {
    baseStyle: {
      table: {
        borderCollapse: 'separate',
        borderSpacing: 0,
      },
    },
    variants: {
      simple: {
        th: {
          borderBottom: '2px solid',
          borderColor: 'gray.200',
          fontWeight: 'semibold',
          textTransform: 'uppercase',
          fontSize: 'xs',
          letterSpacing: 'wider',
          color: 'gray.600',
          bg: 'gray.50',
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.200',
          _hover: {
            bg: 'gray.50',
          },
        },
        tbody: {
          tr: {
            _hover: {
              bg: 'gray.50',
            },
          },
        },
      },
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
