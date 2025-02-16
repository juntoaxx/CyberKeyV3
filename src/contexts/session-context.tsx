import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './auth-context'
import { getAuth, signOut } from 'firebase/auth'

interface SessionContextType {
  lastActivity: Date
  sessionTimeout: number // in minutes
  updateLastActivity: () => void
  setSessionTimeout: (timeout: number) => void
  remainingTime: number // in seconds
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const DEFAULT_SESSION_TIMEOUT = 30 // 30 minutes

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastActivity, setLastActivity] = useState<Date>(new Date())
  const [sessionTimeout, setSessionTimeout] = useState<number>(DEFAULT_SESSION_TIMEOUT)
  const [remainingTime, setRemainingTime] = useState<number>(DEFAULT_SESSION_TIMEOUT * 60)
  const router = useRouter()
  const { user } = useAuth()
  const auth = getAuth()

  const updateLastActivity = () => {
    setLastActivity(new Date())
  }

  // Check session status every minute
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const now = new Date()
      const timeDiff = now.getTime() - lastActivity.getTime()
      const diffMinutes = Math.floor(timeDiff / 1000 / 60)
      const remaining = sessionTimeout * 60 - Math.floor(timeDiff / 1000)

      setRemainingTime(Math.max(0, remaining))

      if (diffMinutes >= sessionTimeout) {
        // Session expired
        signOut(auth)
        router.push('/login')
      } else if (diffMinutes >= sessionTimeout - 5) {
        // Show warning 5 minutes before expiry
        // This will be implemented in the UI components
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [user, lastActivity, sessionTimeout, router, auth])

  // Update activity on user interactions
  useEffect(() => {
    if (!user) return

    const handleActivity = () => {
      updateLastActivity()
    }

    // Track user activity
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
    }
  }, [user])

  const value = {
    lastActivity,
    sessionTimeout,
    updateLastActivity,
    setSessionTimeout,
    remainingTime,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
