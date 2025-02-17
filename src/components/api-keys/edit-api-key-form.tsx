import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateApiKey } from '@/services/api-keys';
import { ApiKey } from '@/types/api-key';
import { toast } from '@/components/ui/use-toast';

interface Props {
  apiKey: ApiKey;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditApiKeyForm({ apiKey, onSuccess, onCancel }: Props) {
  const [name, setName] = useState(apiKey.name);
  const [balance, setBalance] = useState(apiKey.balance?.toString() || '0');
  const [fundingLink, setFundingLink] = useState(apiKey.fundingLink || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateApiKey(apiKey.id, {
        name,
        balance: parseFloat(balance),
        fundingLink: fundingLink || null,
      });

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'API key updated successfully',
        });
        onSuccess?.();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update API key',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBalanceCheck = (orgId: string) => {
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

      <div>
        <Label htmlFor="balance">Current Balance</Label>
        <div className="flex space-x-2">
          <Input
            id="balance"
            type="number"
            step="0.01"
            min="0"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Enter current balance"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => handleBalanceCheck(apiKey.organizationId)}
            className="whitespace-nowrap"
          >
            Check Balance
          </Button>
        </div>
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

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
