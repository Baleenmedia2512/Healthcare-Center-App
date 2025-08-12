/**
 * API service for Patients
 */

import apiClient from './client';

export const PatientService = {
  // Get all patients
  getAllPatients: async (filters = {}) => {
    const response = await apiClient.get('/patients', { params: filters });
    return response.data;
  },
  
  // Get patient by ID
  getPatient: async (id) => {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },
  
  // Create new patient
  createPatient: async (patientData) => {
    const response = await apiClient.post('/patients', patientData);
    return response.data;
  },
  
  // Update patient
  updatePatient: async (id, patientData) => {
    const response = await apiClient.put(`/patients/${id}`, patientData);
    return response.data;
  },
  
  // Delete patient
  deletePatient: async (id) => {
    const response = await apiClient.delete(`/patients/${id}`);
    return response.data;
  }
};

/**
 * API service for Investigations
 */
export const InvestigationService = {
  // Get all investigations
  getAllInvestigations: async () => {
    const response = await apiClient.get('/investigations');
    return response.data;
  },
  
  // Get all investigations for a patient
  getPatientInvestigations: async (patientId) => {
    const response = await apiClient.get(`/investigations?patientId=${patientId}`);
    return response.data;
  },
  
  // Get investigation by ID
  getInvestigation: async (id) => {
    const response = await apiClient.get(`/investigations/${id}`);
    return response.data;
  },
  
  // Create new investigation with proper date handling
  createInvestigation: async (investigationData) => {
    // Make sure date fields are properly formatted
    const formattedData = {
      ...investigationData,
      date: investigationData.date ? new Date(investigationData.date).toISOString() : new Date().toISOString(),
      followUpDate: investigationData.followUpNeeded && investigationData.followUpDate ? 
        new Date(investigationData.followUpDate).toISOString() : null
    };
    
    try {
      const response = await apiClient.post('/investigations', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating investigation:', error);
      throw error;
    }
  },
  
  // Update investigation with proper date handling
  updateInvestigation: async (id, investigationData) => {
    // Make sure date fields are properly formatted
    const formattedData = {
      ...investigationData,
      date: investigationData.date ? new Date(investigationData.date).toISOString() : new Date().toISOString(),
      followUpDate: investigationData.followUpNeeded && investigationData.followUpDate ? 
        new Date(investigationData.followUpDate).toISOString() : null
    };
    
    try {
      const response = await apiClient.put(`/investigations/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error updating investigation:', error);
      throw error;
    }
  },
  
  // Delete investigation
  deleteInvestigation: async (id) => {
    const response = await apiClient.delete(`/investigations/${id}`);
    return response.data;
  }
};

/**
 * API service for Users
 */
export const UserService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    console.log('UserService.getAllUsers called'); // Debug log
    try {
      const response = await apiClient.get('/users');
      console.log('UserService.getAllUsers response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('UserService.getAllUsers error:', error); // Debug log
      throw error;
    }
  },
  
  // Get current user info
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  
  // Create new user (admin only)
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  
  // Update user
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },
  
  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
  
  // Update user password
  updatePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};
