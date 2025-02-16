import React, { useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'

interface CopyButtonProps {
  text: string
  onCopy?: () => void
  className?: string
  label?: string
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  onCopy,
  className = '',
  label = 'Copy to clipboard',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopy?.()

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center p-1 border border-transparent rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
      aria-label={label}
    >
      {copied ? (
        <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
      ) : (
        <ClipboardDocumentIcon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  )
}
