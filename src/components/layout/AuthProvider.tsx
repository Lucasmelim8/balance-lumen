import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, user, isAuthenticated } = useAuthStore();
  const { loadUserData } = useFinanceStore();

  useEffect(() => {
    // Initialize auth
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  useEffect(() => {
    // Load user data when authenticated
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user, loadUserData]);

  return <>{children}</>;
}