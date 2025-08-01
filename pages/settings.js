import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Settings from '../src/pages/Settings/Settings';
import { ProtectedRoute } from '@/lib/auth';

export default function SettingsPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <Settings />
      </MainLayout>
    </ProtectedRoute>
  );
}
