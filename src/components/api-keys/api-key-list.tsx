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
import { CopyButton } from '@/components/common/copy-button'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import EditApiKeyForm from './edit-api-key-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'dateAdded' | 'name' | 'service'>('dateAdded')
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);

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

  const handleEditSuccess = () => {
    setEditingKey(null);
    loadApiKeys();
  };

  const formatCredit = (credit?: number) => {
    if (credit === undefined || credit === null) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(credit)
  }

  const filteredAndSortedKeys = apiKeys.filter((key) => {
    const matchesSearch =
      searchTerm === '' ||
      key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.id.toLowerCase().includes(searchTerm.toLowerCase())

    const isInactive = !key.active
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !isInactive) ||
      (statusFilter === 'inactive' && isInactive)

    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'dateAdded':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      case 'name':
        return a.name.localeCompare(b.name)
      case 'service':
        return a.service.localeCompare(b.service)
      default:
        return 0
    }
  })

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
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search API keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
            }
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'dateAdded' | 'name' | 'service')
            }
          >
            <option value="dateAdded">Sort by Date Added</option>
            <option value="name">Sort by Name</option>
            <option value="service">Sort by Service</option>
          </select>
        </div>
      </div>

      {/* API Key List */}
      <div className="space-y-4">
        {filteredAndSortedKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingKey(apiKey)}
                    aria-label="Edit API key"
                  >
                    Edit
                  </Button>
                  <CopyButton
                    text={apiKey.key}
                    className="ml-2"
                    onCopy={() =>
                      toast({
                        title: 'Success',
                        description: 'API key copied to clipboard',
                      })
                    }
                  />
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

      <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
          </DialogHeader>
          {editingKey && (
            <EditApiKeyForm
              apiKey={editingKey}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingKey(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
