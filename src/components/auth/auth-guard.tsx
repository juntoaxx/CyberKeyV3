'use client';

import { useAuth } from '@/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const publicPaths = ['/', '/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle auth-based navigation
  useEffect(() => {
    if (mounted && !loading) {
      const isPublicPath = publicPaths.includes(pathname);
      
      if (!user && !isPublicPath) {
        // Not logged in and trying to access protected route
        router.push('/');
      } else if (user && pathname === '/login') {
        // Logged in and trying to access login page
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router, mounted]);

  // Don't render anything during SSR or initial mount
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
