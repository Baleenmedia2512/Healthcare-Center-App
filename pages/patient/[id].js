import React from 'react';
import { useRouter } from 'next/router';
import MainLayout from '../../src/components/layout/MainLayout';
import PatientView from '../../src/pages/PatientView/PatientView';
import { ProtectedRoute } from '@/lib/auth';

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <PatientView patientId={id} />
      </MainLayout>
    </ProtectedRoute>
  );
}
