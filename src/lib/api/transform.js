/**
 * Data transformation utilities
 */

// Helper function to transform JSON string fields to objects
export const transformJsonFields = (item) => {
  if (!item || typeof item !== 'object') return item;
  
  const result = { ...item };
  
  // These fields should be objects, not JSON strings
  ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'].forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = JSON.parse(result[field]);
      } catch (e) {
        console.error(`Could not parse ${field} as JSON:`, e);
      }
    }
  });
  
  return result;
};

// Convert snake_case to camelCase
export const snakeToCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

// Convert camelCase to snake_case
export const camelToSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Transform object keys recursively
export const transformObjectKeys = (obj, transformer) => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformObjectKeys(item, transformer));
  }
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      transformer(key), 
      transformObjectKeys(value, transformer)
    ])
  );
};

// Transform data based on direction
export const transformIfNeeded = (data, direction = 'incoming') => {
  if (!data) return data;
  
  const transformer = direction === 'incoming' 
    ? snakeToCamelCase 
    : camelToSnakeCase;
    
  return transformObjectKeys(data, transformer);
};
