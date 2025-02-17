'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createApiKey } from '@/services/api-keys';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';

interface Props {
  onSuccess?: () => void;
}

export default function CreateApiKeyForm({ onSuccess }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [balance, setBalance] = useState('');
  const [fundingLink, setFundingLink] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to create an API key');
      }

      // Validate required fields first
      const nameValue = String(name || '').trim();
      const orgIdValue = String(organizationId || '').trim();
      const fundingLinkValue = String(fundingLink || '').trim();
      const balanceValue = balance ? parseFloat(balance) : 0;
      const daysValue = parseInt(expiresInDays || '30');

      if (!nameValue) {
        throw new Error('Name is required');
      }
      if (!orgIdValue) {
        throw new Error('Organization ID is required');
      }

      const formData = {
        name: nameValue,
        organizationId: orgIdValue,
        key: orgIdValue, // Using organizationId as the key
        providerName: 'Anthropic',
        userId: user.uid,
        balance: balanceValue,
        fundingLink: fundingLinkValue || null,
        expiresAt: new Date(Date.now() + daysValue * 24 * 60 * 60 * 1000)
      };

      const result = await createApiKey(formData);

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'API key created successfully',
        });
        // Reset form
        setName('');
        setOrganizationId('');
        setBalance('');
        setFundingLink('');
        setExpiresInDays('30');
        onSuccess?.();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBalanceCheck = (orgId: string) => {
    if (!orgId) return;
    const url = `https://console.anthropic.com/api/organizations/${orgId}/prepaid/credits`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My API Key"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationId">Organization ID</Label>
        <div className="flex space-x-2">
          <Input
            id="organizationId"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            placeholder="e.g., 01234567-89ab-cdef-0123-456789abcdef"
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => handleBalanceCheck(organizationId)}
            disabled={!organizationId}
            className="whitespace-nowrap"
          >
            Check Balance
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Find your Organization ID in your{' '}
          <a
            href="https://console.anthropic.com/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Anthropic settings
          </a>
        </p>
      </div>

      <div>
        <Label htmlFor="balance">Current Balance</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          min="0"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="Enter your current balance"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Enter your current balance after checking it on Anthropic's website
        </p>
      </div>

      <div>
        <Label htmlFor="fundingLink">Funding Link (Optional)</Label>
        <Input
          id="fundingLink"
          value={fundingLink}
          onChange={(e) => setFundingLink(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label htmlFor="expiresInDays">Expires In (Days)</Label>
        <Input
          id="expiresInDays"
          type="number"
          min="1"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create API Key'
        )}
      </Button>
    </form>
  );
}
