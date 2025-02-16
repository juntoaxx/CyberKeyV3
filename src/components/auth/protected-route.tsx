import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div role="status">
          <Loader2 className="h-8 w-8 animate-spin" aria-label="Loading" />
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect('/login')
    return null
  }

  return <>{children}</>
}
