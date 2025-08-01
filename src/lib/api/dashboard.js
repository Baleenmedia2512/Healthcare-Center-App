/**
 * API helper for fetching dashboard stats
 */

import apiClient from './client';

/**
 * Get dashboard statistics based on user role and tenant info
 */
export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return default stats object instead of throwing error
    return {
      userCount: 0,
      patientCount: 0,
      investigationCount: 0,
      recentActivity: 0,
      myPatientCount: 0,
      recentCases: 0,
      pendingReports: 0,
      clinicCount: 0,
      branchCount: 0
    };
  }
}
