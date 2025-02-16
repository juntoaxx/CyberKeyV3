'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'

export default function TestProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected Content</div>
    </ProtectedRoute>
  )
}
