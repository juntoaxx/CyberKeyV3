import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/router'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth()
  const router = useRouter()

  // Protect dashboard routes
  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900">CyberKey</span>
              </div>
              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/dashboard"
                  className={`${
                    router.pathname === '/dashboard'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </a>
                <a
                  href="/settings"
                  className={`${
                    router.pathname === '/settings'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Settings
                </a>
              </div>
            </div>
            {/* User Menu */}
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <button
                    onClick={() => router.push('/logout')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Content Area */}
        <div className="px-4 py-4 sm:px-0">{children}</div>
      </main>
    </div>
  )
}
