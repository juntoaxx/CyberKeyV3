'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { ApiKey } from '@/lib/models/api-key'
import { ApiKeyService } from '@/lib/services/api-key-service'
import { CreateApiKeyForm } from '@/components/api-keys/create-api-key-form'
import { ApiKeyList } from '@/components/api-keys/api-key-list'

export default function ApiKeysPage() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

  const loadApiKeys = async () => {
    if (!user) return

    try {
      setLoading(true)
      const apiKeyService = ApiKeyService.getInstance()
      const keys = await apiKeyService.getUserApiKeys(user.uid)
      setApiKeys(keys)
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApiKeys()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div role="status">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="mt-2 text-muted-foreground">
          Create and manage your API keys
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Create New API Key</h2>
        <div className="rounded-lg border p-4">
          <CreateApiKeyForm />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Your API Keys</h2>
        <ApiKeyList apiKeys={apiKeys} onDelete={loadApiKeys} />
      </div>
    </div>
  )
}
