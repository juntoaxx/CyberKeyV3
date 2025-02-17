'use client';

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function HomePage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    
    try {
      setError(null);
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign-in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">
          Welcome to CyberKey V3
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your Advanced API Key Management System
        </p>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <Button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="w-full max-w-sm"
        >
          {isSigningIn ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            'Continue with Google'
          )}
        </Button>
      </div>
    </div>
  );
}
