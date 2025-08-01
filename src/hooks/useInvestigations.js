/**
 * useInvestigations Hook
 * 
 * Custom hook for investigation data management
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { InvestigationService } from '../lib/api';

export const useInvestigations = (patientId = null) => {
  const [investigations, setInvestigations] = useState([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Fetch all investigations for a patient
  const fetchInvestigations = useCallback(async (id = patientId) => {
    if (!id) {
      setError('Patient ID is required');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await InvestigationService.getPatientInvestigations(id);
      setInvestigations(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch investigations');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch investigations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast, patientId]);

  // Fetch investigation by ID
  const fetchInvestigationById = useCallback(async (id) => {
    if (!id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await InvestigationService.getInvestigation(id);
      setSelectedInvestigation(data);
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch investigation with ID: ${id}`);
      toast({
        title: 'Error',
        description: err.message || `Failed to fetch investigation with ID: ${id}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create investigation
  const createInvestigation = useCallback(async (investigationData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await InvestigationService.createInvestigation(investigationData);
      setInvestigations(prev => [...prev, data]);
      toast({
        title: 'Success',
        description: 'Investigation created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create investigation');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create investigation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update investigation
  const updateInvestigation = useCallback(async (id, investigationData) => {
    if (!id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await InvestigationService.updateInvestigation(id, investigationData);
      
      // Update the investigations list
      setInvestigations(prev => 
        prev.map(investigation => investigation.id === id ? data : investigation)
      );
      
      // Update selected investigation if it's the one being updated
      if (selectedInvestigation && selectedInvestigation.id === id) {
        setSelectedInvestigation(data);
      }
      
      toast({
        title: 'Success',
        description: 'Investigation updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return data;
    } catch (err) {
      setError(err.message || `Failed to update investigation with ID: ${id}`);
      toast({
        title: 'Error',
        description: err.message || `Failed to update investigation with ID: ${id}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedInvestigation]);

  // Delete investigation
  const deleteInvestigation = useCallback(async (id) => {
    if (!id) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await InvestigationService.deleteInvestigation(id);
      
      // Remove from investigations list
      setInvestigations(prev => prev.filter(investigation => investigation.id !== id));
      
      // Clear selected investigation if it's the one being deleted
      if (selectedInvestigation && selectedInvestigation.id === id) {
        setSelectedInvestigation(null);
      }
      
      toast({
        title: 'Success',
        description: 'Investigation deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      setError(err.message || `Failed to delete investigation with ID: ${id}`);
      toast({
        title: 'Error',
        description: err.message || `Failed to delete investigation with ID: ${id}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedInvestigation]);

  // Load investigations when patient ID changes
  useEffect(() => {
    if (patientId) {
      fetchInvestigations(patientId);
    }
  }, [patientId, fetchInvestigations]);

  return {
    investigations,
    selectedInvestigation,
    isLoading,
    error,
    fetchInvestigations,
    fetchInvestigationById,
    createInvestigation,
    updateInvestigation,
    deleteInvestigation,
    setSelectedInvestigation,
  };
};
