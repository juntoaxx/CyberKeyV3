import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface ApiKeyDisplayProps {
  apiKey: string
  label?: string
}

export function ApiKeyDisplay({ apiKey, label }: ApiKeyDisplayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setHasCopied(true)
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard',
      })
      // Reset copy status after 2 seconds
      setTimeout(() => setHasCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy API key',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-grow relative">
        <div className="flex items-center border rounded-md p-2 bg-muted">
          <span className="flex-grow font-mono">
            {isVisible ? apiKey : '•'.repeat(Math.min(20, apiKey.length))}
          </span>
        </div>
        {label && (
          <span className="absolute -top-2 left-2 px-1 text-xs bg-background">
            {label}
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleVisibility}
        aria-label={isVisible ? 'Hide API Key' : 'Show API Key'}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        aria-label="Copy API Key"
      >
        {hasCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
