import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Reports from '../src/pages/Reports/Reports';
import { ProtectedRoute } from '@/lib/auth';

export default function ReportsPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <Reports />
      </MainLayout>
    </ProtectedRoute>
  );
}
