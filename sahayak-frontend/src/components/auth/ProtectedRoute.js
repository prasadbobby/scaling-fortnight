// src/components/auth/ProtectedRoute.js
'use client';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return children;
}