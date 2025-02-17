'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/settings-context';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export function ApiKeyDefaults() {
  const { settings, updateSettings } = useSettings();
  const [usageLimit, setUsageLimit] = useState<string>(
    settings?.apiKeyDefaults.usageLimit?.toString() || ''
  );
  const [newDomain, setNewDomain] = useState('');
  const allowedDomains = settings?.apiKeyDefaults.allowedDomains || [];

  const handleUsageLimitChange = async () => {
    try {
      const limit = usageLimit === '' ? null : parseInt(usageLimit, 10);
      await updateSettings({
        apiKeyDefaults: {
          ...settings?.apiKeyDefaults,
          usageLimit: limit,
        },
      });
      toast.success('Usage limit updated successfully');
    } catch (error) {
      toast.error('Failed to update usage limit');
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain) return;

    try {
      const domains = new Set([...allowedDomains, newDomain]);
      await updateSettings({
        apiKeyDefaults: {
          ...settings?.apiKeyDefaults,
          allowedDomains: Array.from(domains),
        },
      });
      setNewDomain('');
      toast.success('Domain added successfully');
    } catch (error) {
      toast.error('Failed to add domain');
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    try {
      const domains = allowedDomains.filter((d) => d !== domain);
      await updateSettings({
        apiKeyDefaults: {
          ...settings?.apiKeyDefaults,
          allowedDomains: domains,
        },
      });
      toast.success('Domain removed successfully');
    } catch (error) {
      toast.error('Failed to remove domain');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Defaults</CardTitle>
        <CardDescription>
          Configure default settings for new API keys
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage Limit</Label>
          <div className="flex space-x-2">
            <Input
              id="usageLimit"
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="No limit"
            />
            <Button onClick={handleUsageLimitChange}>Save</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Set a default usage limit for new API keys. Leave empty for unlimited usage.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allowedDomains">Allowed Domains</Label>
          <div className="flex space-x-2">
            <Input
              id="allowedDomains"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
            />
            <Button onClick={handleAddDomain}>Add</Button>
          </div>
          <div className="mt-2">
            {allowedDomains.map((domain) => (
              <div
                key={domain}
                className="flex items-center justify-between rounded-md border px-3 py-2 mt-2"
              >
                <span>{domain}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDomain(domain)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Add domains that are allowed to use the API keys. Leave empty to allow all domains.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
