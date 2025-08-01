import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PatientList from '@/components/patients/PatientList';
import { ProtectedRoute } from '@/lib/auth';

export default function PatientsPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <PatientList />
      </MainLayout>
    </ProtectedRoute>
  );
}
