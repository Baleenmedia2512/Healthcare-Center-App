import { initializeStorageBuckets } from '@/utils/localFileStorage';

export async function initializeStorage() {
  console.log('Initializing local storage resources...');
  
  try {
    // Initialize storage directories
    await initializeStorageBuckets();
    
    console.log('Local storage initialization complete');
    return { success: true };
  } catch (error) {
    console.error('Error initializing local storage:', error);
    return { success: false, error };
  }
}
