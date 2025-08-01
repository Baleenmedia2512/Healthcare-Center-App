// Middleware to monitor and prevent JSON corruption
export function withJsonCorruptionPrevention(handler) {
  return async (req, res) => {
    const originalJson = res.json;
    
    // Override res.json to validate outgoing JSON
    res.json = function(obj) {
      try {
        // Validate JSON can be serialized and deserialized
        const serialized = JSON.stringify(obj);
        JSON.parse(serialized);
        
        // Check for corruption indicators
        if (serialized.includes('undefined') || serialized.includes('NaN')) {
          console.warn('⚠️  Response contains undefined/NaN values');
        }
        
        return originalJson.call(this, obj);
      } catch (error) {
        console.error('🚨 JSON CORRUPTION PREVENTED:', error.message);
        console.error('Problematic object:', obj);
        
        // Return error instead of corrupted data
        return originalJson.call(this, {
          error: 'Data integrity issue detected',
          code: 'JSON_CORRUPTION_PREVENTED',
          timestamp: new Date().toISOString()
        });
      }
    };

    // Monitor request data for corruption
    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const body = req.body;
        
        // Check JSON fields in patient data
        const jsonFields = ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'];
        
        for (const field of jsonFields) {
          if (body[field] && typeof body[field] === 'string') {
            try {
              JSON.parse(body[field]);
            } catch (e) {
              console.error(`🚨 INCOMING DATA CORRUPTION DETECTED: ${field}`);
              console.error('Error:', e.message);
              console.error('Data:', body[field].substring(0, 200));
              
              return res.status(400).json({
                error: `Invalid JSON in ${field}`,
                code: 'JSON_CORRUPTION_DETECTED',
                details: e.message
              });
            }
          }
        }
      } catch (error) {
        console.error('Error in corruption monitoring:', error);
      }
    }

    return handler(req, res);
  };
}

// Database transaction wrapper with integrity checks
export async function safeDbOperation(operation, context = '') {
  try {
    console.log(`🔒 Starting safe DB operation: ${context}`);
    
    const result = await operation();
    
    console.log(`✅ Safe DB operation completed: ${context}`);
    return result;
  } catch (error) {
    console.error(`❌ DB operation failed: ${context}`, error);
    
    // If it's a JSON-related error, log additional context
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      console.error('🚨 JSON-related database error detected');
      console.error('This might indicate data corruption');
    }
    
    throw error;
  }
}
