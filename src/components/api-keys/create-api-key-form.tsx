import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ApiKeyService } from '@/lib/services/api-key-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

export function CreateApiKeyForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [service, setService] = useState('')
  const [credit, setCredit] = useState('')
  const [fundingUrl, setFundingUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)
      const apiKeyService = ApiKeyService.getInstance()
      
      await apiKeyService.storeApiKey(user.uid, {
        name,
        key,
        service,
        credit: parseFloat(credit) || 0,
        fundingUrl: fundingUrl || null,
        dateAdded: new Date().toISOString(),
      })

      toast({
        title: 'Success',
        description: 'API key stored successfully',
      })

      router.refresh()
      setName('')
      setKey('')
      setService('')
      setCredit('')
      setFundingUrl('')
    } catch (error) {
      console.error('Error storing API key:', error)
      toast({
        title: 'Error',
        description: 'Failed to store API key',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="service" className="block text-sm font-medium">
          Service Name
        </label>
        <Input
          id="service"
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="e.g., OpenAI, AWS, GitHub"
          required
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Key Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Production API Key"
          required
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="key" className="block text-sm font-medium">
          API Key
        </label>
        <Input
          id="key"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your API key"
          required
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="credit" className="block text-sm font-medium">
          Available Credit
        </label>
        <Input
          id="credit"
          type="number"
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Optional: Track available credit for this service
        </p>
      </div>

      <div>
        <label htmlFor="fundingUrl" className="block text-sm font-medium">
          Funding Page URL
        </label>
        <Input
          id="fundingUrl"
          type="url"
          value={fundingUrl}
          onChange={(e) => setFundingUrl(e.target.value)}
          placeholder="https://example.com/billing"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Optional: Link to the service's billing/funding page
        </p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Storing...' : 'Store API Key'}
      </Button>
    </form>
  )
}
