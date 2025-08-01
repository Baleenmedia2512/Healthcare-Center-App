/**
 * API Services Index
 * 
 * Export all API services from a single file
 */

import apiClient from './client';
import { transformJsonFields, transformIfNeeded } from './transform';
import { PatientService, InvestigationService, UserService } from './services';

// Export individual services
export {
  apiClient,
  PatientService,
  InvestigationService,
  UserService,
  transformJsonFields,
  transformIfNeeded
};
