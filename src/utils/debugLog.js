/**
 * Debug logging utility for better error reporting
 */

// Set to true to enable debug logging
const DEBUG_MODE = true;

/**
 * Enhanced debug logging function
 * @param {string} title - Log title
 * @param {any} data - Data to log
 * @param {string} type - Log type (log, error, warn, info)
 */
export const debugLog = (title, data, type = 'log') => {
  if (!DEBUG_MODE) return;

  const styles = {
    title: 'color: #0066ff; font-weight: bold; font-size: 1.1em',
    log: 'color: #333333',
    error: 'color: #ff0033; font-weight: bold',
    warn: 'color: #ff9900',
    info: 'color: #00cc66'
  };

  try {
    console.groupCollapsed(`%c${title}`, styles.title);
    
    if (type === 'error') {
      console.error('%cERROR:', styles.error, data);
    } else if (type === 'warn') {
      console.warn('%cWARNING:', styles.warn, data);
    } else if (type === 'info') {
      console.info('%cINFO:', styles.info, data);
    } else {
      console.log(data);
    }
    
    // Log the stack trace for errors
    if (type === 'error' && data instanceof Error) {
      console.error('Stack:', data.stack);
    }
    
    console.groupEnd();
  } catch (e) {
    // Fallback for environments that don't support console styling
    console.log(`${title}:`, data);
  }
};

export default debugLog;
