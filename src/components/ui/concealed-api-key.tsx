'use client';

import { useState } from 'react';
import { Button } from './button';
import { toast } from 'react-hot-toast';
import { Copy } from 'lucide-react';

interface ConcealedApiKeyProps {
  apiKey: string;
  className?: string;
}

export const ConcealedApiKey = ({ apiKey, className = '' }: ConcealedApiKeyProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const maskString = (str: string) => {
    if (!str) return '';
    const firstFour = str.slice(0, 4);
    const lastFour = str.slice(-4);
    return `${firstFour}...${lastFour}`;
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <label className="text-sm font-medium">API Key</label>
          <div className="mt-1 flex items-center space-x-2">
            <code className="flex-1 p-2 rounded-md border border-input bg-background text-sm font-mono">
              {maskString(apiKey)}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 hover:bg-accent rounded-md relative group"
              aria-label="Copy API key to clipboard"
            >
              <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
