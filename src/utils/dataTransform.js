/**
 * Utility functions to transform data between camelCase (frontend) and snake_case (backend)
 * This utility ensures consistent data format between the React frontend and FastAPI backend
 */

/**
 * Checks if a value should be processed for key transformation
 * @param {*} value - The value to check
 * @returns {boolean} Whether the value should be processed
 */
const shouldProcessValue = (value) => {
  return value !== null && 
         value !== undefined && 
         typeof value === 'object' &&
         !(value instanceof File) &&
         !(value instanceof Blob) &&
         !(value instanceof Date) &&
         !(value instanceof FormData);
};

/**
 * Converts snake_case string to camelCase
 * @param {string} str - Snake case string
 * @returns {string} Camel case string
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (match, group) => group.toUpperCase());
};

/**
 * Converts camelCase string to snake_case
 * @param {string} str - Camel case string
 * @returns {string} Snake case string
 */
const camelToSnake = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

/**
 * Converts snake_case keys to camelCase throughout an object or array
 * @param {Object|Array} data - Data with snake_case keys
 * @returns {Object|Array} Data with camelCase keys
 */
export function snakeToCamelCase(data) {
  if (!shouldProcessValue(data)) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(snakeToCamelCase);
  }

  return Object.entries(data).reduce((result, [key, value]) => {
    // Convert key from snake_case to camelCase
    const camelKey = snakeToCamel(key);
    
    // Recursively transform nested objects and arrays
    result[camelKey] = shouldProcessValue(value) ? snakeToCamelCase(value) : value;
    
    return result;
  }, {});
}

/**
 * Converts camelCase keys to snake_case throughout an object or array
 * @param {Object|Array} data - Data with camelCase keys
 * @returns {Object|Array} Data with snake_case keys
 */
export function camelToSnakeCase(data) {
  if (!shouldProcessValue(data)) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(camelToSnakeCase);
  }
  
  return Object.entries(data).reduce((result, [key, value]) => {
    // Convert key from camelCase to snake_case
    const snakeKey = camelToSnake(key);
    
    // Recursively transform nested objects and arrays
    result[snakeKey] = shouldProcessValue(value) ? camelToSnakeCase(value) : value;
    
    return result;
  }, {});
}

/**
 * Determines if an object needs transformation (has keys in the wrong format)
 * @param {Object} obj - The object to check
 * @param {boolean} lookForSnakeCase - Whether to look for snake_case (true) or camelCase (false) 
 * @returns {boolean} Whether the object contains keys in the format we're checking for
 */
export function needsTransformation(obj, lookForSnakeCase = true) {
  if (!shouldProcessValue(obj)) {
    return false;
  }
  
  if (Array.isArray(obj)) {
    // Check the first element if it's an array
    return obj.length > 0 ? needsTransformation(obj[0], lookForSnakeCase) : false;
  }
  
  // Check if any key matches the pattern we're looking for
  return Object.keys(obj).some(key => {
    if (lookForSnakeCase) {
      // Looking for snake_case keys (contains underscores)
      return key.includes('_');
    } else {
      // Looking for camelCase keys (contains uppercase letter not at the start)
      return /[A-Z]/.test(key) && key[0] !== key[0].toUpperCase();
    }
  });
}

/**
 * Transforms data if needed based on the target format
 * @param {Object|Array} data - The data to potentially transform
 * @param {boolean} toSnakeCase - Direction of the transformation (true for camelCase → snake_case)
 * @returns {Object|Array} Transformed data or original if no transformation needed
 */
export function transformIfNeeded(data, toSnakeCase = true) {
  if (!shouldProcessValue(data)) {
    return data;
  }
  
  // Check if transformation is needed
  const needsConversion = needsTransformation(data, !toSnakeCase);
  
  // If transformation is needed, apply the appropriate conversion function
  if (needsConversion) {
    return toSnakeCase ? camelToSnakeCase(data) : snakeToCamelCase(data);
  }
  
  return data;
}

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} dateString - The date to format
 * @param {boolean} includeTime - Whether to include the time in the output
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}
