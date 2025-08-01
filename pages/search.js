import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Search from '../src/pages/Search/Search';
import { ProtectedRoute } from '@/lib/auth';

export default function SearchPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <Search />
      </MainLayout>
    </ProtectedRoute>
  );
}
