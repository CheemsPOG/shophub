import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function RequireRole({ role, children }: { role: 'buyer' | 'seller' | 'admin'; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to={`/login/${role}`} replace />;
  }
  if (user.role !== role) {
    return <Navigate to={`/login/${user.role}`} replace />;
  }
  return <>{children}</>;
}
