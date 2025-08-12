import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PatientService, InvestigationService } from '../lib/api';
import { useAuth } from '../lib/auth/AuthContext';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State for patients and related data
  const [patients, setPatients] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isApiHealthy, setIsApiHealthy] = useState(true);
  
  // Get authentication state from AuthContext
  const { isAuthenticated, user: sessionUser } = useAuth();
  
  // Use real user data from session instead of hardcoded data
  const [currentUser, setCurrentUser] = useState(null);
  
  // Doctor data - this should be fetched from API based on user's branch
  const [doctors, setDoctors] = useState([]);

  // Update current user when session changes
  useEffect(() => {
    if (sessionUser) {
      setCurrentUser(sessionUser);
    } else {
      setCurrentUser(null);
    }
  }, [sessionUser]);

  // Error handling utility
  const handleError = useCallback((error, operation) => {
    console.error(`Error in ${operation}:`, error);
    const message = error.message || `Failed to ${operation}`;
    setError(message);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
    
    return message;
  }, []);

  // Check API health
  const checkApiHealth = useCallback(async () => {
    try {
      // Check API health by making a simple request
      await fetch('/api/health');
      setIsApiHealthy(true);
      return true;
    } catch (error) {
      setIsApiHealthy(false);
      return false;
    }
  }, []);
  
  // Load patients data from API
  const fetchPatients = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PatientService.getAllPatients();
      setPatients(Array.isArray(data) ? data : data.patients || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      // Only set error if it's not a 401 (unauthorized) error
      if (err.response?.status !== 401) {
        handleError(err, 'fetch patients');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleError]);

  // Load investigations data
  const fetchInvestigations = useCallback(async (patientId = null) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = patientId 
        ? await InvestigationService.getPatientInvestigations(patientId)
        : await InvestigationService.getAllInvestigations();
      setInvestigations(Array.isArray(data) ? data : data.investigations || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch investigations:", err);
      if (err.response?.status !== 401) {
        handleError(err, 'fetch investigations');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleError]);

  // Load doctors data from API (users with role 'doctor')
  const fetchDoctors = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter for users with role 'doctor' and ensure they have required fields
      const doctorUsers = data.filter(user => 
        user.role === 'doctor' && 
        user.isActive && 
        user.fullName
      ).map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        branchId: user.branchId,
        specialty: user.specialty || 'General Medicine' // Default specialty if not available
      }));
      
      setDoctors(doctorUsers);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      if (err.response?.status !== 401) {
        handleError(err, 'fetch doctors');
      }
    }
  }, [isAuthenticated, handleError]);

  // Initial data load
  useEffect(() => {
    if (isAuthenticated) {
      checkApiHealth();
      fetchPatients();
      fetchInvestigations();
      fetchDoctors();
    }
  }, [isAuthenticated, fetchPatients, fetchInvestigations, fetchDoctors, checkApiHealth]);

  // Add a new patient
  const addPatient = async (patientData) => {
    if (!patientData || typeof patientData !== 'object') {
      throw new Error('Valid patient data is required');
    }

    // Additional validation for required fields
    if (!patientData.mobileNumber) {
      throw new Error('Mobile number is required');
    }
    
    if (!patientData.chiefComplaints) {
      throw new Error('Chief complaints are required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Add unique ID and timestamp if not present
      const patientWithDefaults = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...patientData,
      };

      const newPatient = await PatientService.createPatient(patientWithDefaults);
      
      // Ensure JSON fields are properly parsed
      const parsedPatient = {
        ...newPatient,
        medicalHistory: typeof newPatient.medicalHistory === 'string' 
          ? JSON.parse(newPatient.medicalHistory) 
          : newPatient.medicalHistory,
        physicalGenerals: typeof newPatient.physicalGenerals === 'string' 
          ? JSON.parse(newPatient.physicalGenerals) 
          : newPatient.physicalGenerals,
        menstrualHistory: typeof newPatient.menstrualHistory === 'string' 
          ? JSON.parse(newPatient.menstrualHistory) 
          : newPatient.menstrualHistory,
        foodAndHabit: typeof newPatient.foodAndHabit === 'string' 
          ? JSON.parse(newPatient.foodAndHabit) 
          : newPatient.foodAndHabit
      };
      
      // Add the new patient to the state
      setPatients(prevPatients => [...prevPatients, parsedPatient]);
      setError(null);
      return parsedPatient;
    } catch (err) {
      const errorMessage = handleError(err, 'create patient');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing patient
  const updatePatient = async (patientId, updatedData) => {
    if (!patientId) throw new Error('Patient ID is required');
    if (!updatedData || typeof updatedData !== 'object') {
      throw new Error('Valid patient data is required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const dataWithTimestamp = {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };

      const updatedPatient = await PatientService.updatePatient(patientId, dataWithTimestamp);
      
      // Ensure JSON fields are properly parsed
      const parsedPatient = {
        ...updatedPatient,
        medicalHistory: typeof updatedPatient.medicalHistory === 'string' 
          ? JSON.parse(updatedPatient.medicalHistory) 
          : updatedPatient.medicalHistory,
        physicalGenerals: typeof updatedPatient.physicalGenerals === 'string' 
          ? JSON.parse(updatedPatient.physicalGenerals) 
          : updatedPatient.physicalGenerals,
        menstrualHistory: typeof updatedPatient.menstrualHistory === 'string' 
          ? JSON.parse(updatedPatient.menstrualHistory) 
          : updatedPatient.menstrualHistory,
        foodAndHabit: typeof updatedPatient.foodAndHabit === 'string' 
          ? JSON.parse(updatedPatient.foodAndHabit) 
          : updatedPatient.foodAndHabit
      };
      
      // Update the patient in the state
      setPatients(prevPatients =>
        prevPatients.map(patient =>
          patient.id === patientId ? parsedPatient : patient
        )
      );
      
      setError(null);
      return parsedPatient;
    } catch (err) {
      const errorMessage = handleError(err, 'update patient');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a patient
  const deletePatient = async (patientId) => {
    if (!patientId) throw new Error('Patient ID is required');

    setIsLoading(true);
    setError(null);
    
    try {
      await PatientService.deletePatient(patientId);
      
      // Remove the patient from the state
      setPatients(prevPatients =>
        prevPatients.filter(patient => patient.id !== patientId)
      );
      
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = handleError(err, 'delete patient');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Add investigation
  const addInvestigation = async (investigationData) => {
    if (!investigationData || typeof investigationData !== 'object') {
      throw new Error('Valid investigation data is required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const investigationWithDefaults = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...investigationData,
      };

      const newInvestigation = await InvestigationService.createInvestigation(investigationWithDefaults);
      
      setInvestigations(prevInvestigations => [...prevInvestigations, newInvestigation]);
      setError(null);
      return newInvestigation;
    } catch (err) {
      const errorMessage = handleError(err, 'create investigation');
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error manually
  const clearError = () => setError(null);

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      fetchPatients(),
      fetchInvestigations(),
      checkApiHealth(),
    ]);
  };

  const value = {
    // Data
    patients,
    investigations,
    doctors,
    currentUser,
    
    // State
    isLoading,
    error,
    isApiHealthy,
    
    // Actions
    addPatient,
    updatePatient,
    deletePatient,
    addInvestigation,
    fetchPatients,
    fetchInvestigations,
    clearError,
    refreshData,
    checkApiHealth,
    
    // API services
    patientsAPI: PatientService,
    investigationsAPI: InvestigationService,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

