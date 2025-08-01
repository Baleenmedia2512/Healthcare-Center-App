import React from 'react';
import MainLayout from '../../src/components/layout/MainLayout';
import PatientRegistration from '../../src/pages/PatientRegistration/PatientRegistration';
import { ProtectedRoute } from '@/lib/auth';

export default function PatientRegisterPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <PatientRegistration />
      </MainLayout>
    </ProtectedRoute>
  );
}
