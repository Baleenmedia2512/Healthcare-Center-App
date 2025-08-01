/**
 * usePatients Hook
 * 
 * Custom hook for patient data management
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { PatientService } from '../lib/api';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Fetch all patients
  const fetchPatients = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PatientService.getAllPatients(filters);
      setPatients(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch patients');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch patients',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch patient by ID
  const fetchPatientById = useCallback(async (id) => {
    if (!id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PatientService.getPatient(id);
      setSelectedPatient(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch patient with ID: ${id}`);
      toast({
        title: 'Error',
        description: err.message || `Failed to fetch patient with ID: ${id}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create patient
  const createPatient = useCallback(async (patientData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PatientService.createPatient(patientData);
      setPatients(prev => [...prev, data]);
      toast({
        title: 'Success',
        description: 'Patient created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create patient');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create patient',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update patient
  const updatePatient = useCallback(async (id, patientData) => {
    if (!id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PatientService.updatePatient(id, patientData);
      
      // Update the patients list
      setPatients(prev => 
        prev.map(patient => patient.id === id ? data : patient)
      );
      
      // Update selected patient if it's the one being updated
      if (selectedPatient && selectedPatient.id === id) {
        setSelectedPatient(data);
      }
      
      toast({
        title: 'Success',
        description: 'Patient updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return data;
    } catch (err) {
      setError(err.message || `Failed to update patient with ID: ${id}`);
      toast({
        title: 'Error',
        description: err.message || `Failed to update patient with ID: ${id}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedPatient]);

  // Delete patient
  const deletePatient = useCallback(async (id) => {
    if (!id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await PatientService.deletePatient(id);
      
      // Remove from patients list
      setPatients(prev => prev.filter(patient => patient.id !== id));
      
      // Clear selected patient if it's the one being deleted
      if (selectedPatient && selectedPatient.id === id) {
        setSelectedPatient(null);
      }
      
      toast({
        title: 'Success',
        description: 'Patient deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      setError(err.message || `Failed to delete patient with ID: ${id}`);
      toast({
        title: 'Error',
        description: err.message || `Failed to delete patient with ID: ${id}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedPatient]);

  // Reset state
  const reset = useCallback(() => {
    setPatients([]);
    setSelectedPatient(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    patients,
    selectedPatient,
    isLoading,
    error,
    fetchPatients,
    fetchPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    setSelectedPatient,
    reset,
  };
};
