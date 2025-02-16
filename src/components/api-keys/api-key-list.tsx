import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { ApiKeyService } from '@/lib/services/api-key-service'
import { Button } from '@/components/ui/button'
import { ApiKeyDisplay } from './api-key-display'
import { Trash2, ExternalLink, DollarSign } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface ApiKey {
  id: string
  name: string
  service: string
  key: string
  dateAdded: string
  active: boolean
  credit?: number
  fundingUrl?: string | null
}

export function ApiKeyList() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadApiKeys()
    }
  }, [user])

  const loadApiKeys = async () => {
    try {
      const apiKeyService = ApiKeyService.getInstance()
      const keys = await apiKeyService.getApiKeys(user!.uid)
      setApiKeys(keys)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const apiKeyService = ApiKeyService.getInstance()
      await apiKeyService.deleteApiKey(id)
      setApiKeys(apiKeys.filter(key => key.id !== id))
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const apiKeyService = ApiKeyService.getInstance()
      await apiKeyService.toggleApiKeyStatus(id, active)
      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, active } : key
      ))
      toast({
        title: 'Success',
        description: `API key ${active ? 'activated' : 'deactivated'} successfully`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update API key status',
        variant: 'destructive',
      })
    }
  }

  const formatCredit = (credit?: number) => {
    if (credit === undefined || credit === null) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(credit)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No API keys stored yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((apiKey) => (
        <Card key={apiKey.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{apiKey.name}</CardTitle>
                <CardDescription>{apiKey.service}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={apiKey.active}
                  onCheckedChange={(checked) => handleToggleActive(apiKey.id, checked)}
                  aria-label="Toggle API key active status"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(apiKey.id)}
                  aria-label="Delete API key"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ApiKeyDisplay 
              apiKey={apiKey.key} 
              label={apiKey.active ? 'Active' : 'Inactive'} 
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Added on {new Date(apiKey.dateAdded).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-4">
                {apiKey.credit !== undefined && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCredit(apiKey.credit)}</span>
                  </div>
                )}
                {apiKey.fundingUrl && (
                  <a
                    href={apiKey.fundingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Add Funds
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
