'use client';

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function Home() {
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
    <div className="container mx-auto px-4 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full text-center space-y-0 mt-24">
        <div className="w-[720px] h-[240px] relative mx-auto -ml-[90px]">
          <Image
            src="/CyberKey.png"
            alt="CyberKey Logo"
            fill
            sizes="(max-width: 600px) 100vw, 600px"
            style={{ 
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            priority
            quality={100}
          />
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <Button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="w-full max-w-sm mx-auto -mt-[200px] bg-black hover:bg-black/90 text-white dark:bg-black dark:hover:bg-black/90 dark:text-white"
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
