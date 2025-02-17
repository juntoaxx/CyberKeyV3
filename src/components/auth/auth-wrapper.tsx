'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AuthProvider = dynamic(
  () => import('@/contexts/auth-context').then(mod => mod.AuthProvider),
  { ssr: false }
);

const AuthGuard = dynamic(
  () => import('./auth-guard').then(mod => mod.AuthGuard),
  { ssr: false }
);

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthProvider>
        <AuthGuard>{children}</AuthGuard>
      </AuthProvider>
    </Suspense>
  );
}
