import React, { useEffect, useState } from 'react'
import { useSession } from '@/contexts/session-context'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/router'

export const SessionTimeoutWarning: React.FC = () => {
  const { remainingTime, updateLastActivity, sessionTimeout } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const router = useRouter()
  const auth = getAuth()

  useEffect(() => {
    // Show warning when 5 minutes or less remaining
    setShowWarning(remainingTime <= 300 && remainingTime > 0)
  }, [remainingTime])

  const handleExtendSession = () => {
    updateLastActivity()
    setShowWarning(false)
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (!showWarning) return null

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-md rounded shadow-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Your session will expire in {Math.ceil(remainingTime / 60)} minutes
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleExtendSession}
              className="text-sm font-medium text-yellow-700 hover:text-yellow-600 focus:outline-none focus:underline"
            >
              Extend Session
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-yellow-700 hover:text-yellow-600 focus:outline-none focus:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
