import React, { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface DomainListProps {
  domains: string[]
  onChange: (domains: string[]) => void
}

export const DomainList: React.FC<DomainListProps> = ({ domains, onChange }) => {
  const [newDomain, setNewDomain] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validateDomain = (domain: string) => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  const handleAddDomain = () => {
    const domain = newDomain.trim().toLowerCase()
    
    if (!domain) {
      setError('Domain cannot be empty')
      return
    }

    if (!validateDomain(domain)) {
      setError('Please enter a valid domain')
      return
    }

    if (domains.includes(domain)) {
      setError('Domain already exists')
      return
    }

    onChange([...domains, domain])
    setNewDomain('')
    setError(null)
  }

  const handleRemoveDomain = (domainToRemove: string) => {
    onChange(domains.filter((domain) => domain !== domainToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddDomain()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="domain"
          className="block text-sm font-medium text-gray-700"
        >
          Add Allowed Domain
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="domain"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="example.com"
            value={newDomain}
            onChange={(e) => {
              setNewDomain(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleAddDomain}
            className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-2">
        {domains.map((domain) => (
          <div
            key={domain}
            className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2"
          >
            <span className="text-sm text-gray-900">{domain}</span>
            <button
              type="button"
              onClick={() => handleRemoveDomain(domain)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
