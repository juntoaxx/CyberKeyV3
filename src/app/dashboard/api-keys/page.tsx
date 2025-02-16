'use client'

import { useAuth } from '@/contexts/auth-context'
import { ApiKeyService } from '@/lib/services/api-key-service'
import { useEffect, useState } from 'react'
import { ApiKey } from '@/lib/models/api-key'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Copy, Plus, Trash } from 'lucide-react'

export default function ApiKeysPage() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        if (!user) return
        const service = ApiKeyService.getInstance()
        const keys = await service.listApiKeys(user.uid)
        setApiKeys(keys)
      } catch (error) {
        console.error('Error loading API keys:', error)
        toast({
          title: 'Error',
          description: 'Failed to load API keys',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadApiKeys()
  }, [user])

  const handleCreateApiKey = async () => {
    try {
      if (!user) return
      const service = ApiKeyService.getInstance()
      const newKey = await service.createApiKey(user.uid, {
        name: `API Key ${apiKeys.length + 1}`,
        balance: 100,
        allowedOrigins: ['*'],
      })
      setApiKeys([...apiKeys, newKey])
      toast({
        title: 'Success',
        description: 'API key created successfully',
      })
    } catch (error) {
      console.error('Error creating API key:', error)
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      const service = ApiKeyService.getInstance()
      await service.deleteApiKey(keyId)
      setApiKeys(apiKeys.filter((key) => key.id !== keyId))
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      })
    }
  }

  const handleCopyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      toast({
        title: 'Success',
        description: 'API key copied to clipboard',
      })
    } catch (error) {
      console.error('Error copying API key:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy API key',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" role="status" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button onClick={handleCreateApiKey}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Key
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-lg font-medium">No API Keys</p>
            <p className="text-sm text-gray-500">
              Create your first API key to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{apiKey.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Balance:</span>
                    <span>{apiKey.balance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        apiKey.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {apiKey.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCopyApiKey(apiKey.key)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
