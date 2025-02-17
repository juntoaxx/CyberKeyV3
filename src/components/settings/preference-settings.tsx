'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/contexts/settings-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PreferenceSettings() {
  const { settings, updateSettings } = useSettings();

  if (!settings) return null;

  // Generate options for days 1-90
  const daysOptions = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your application experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={settings.preferences.theme}
            onValueChange={(value) => updateSettings({
              preferences: {
                ...settings.preferences,
                theme: value as 'light' | 'dark' | 'system',
              },
            })}
          >
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultExpirationDays">Default API Key Expiration (Days)</Label>
          <Select
            value={String(settings.preferences.defaultExpirationDays || 30)}
            onValueChange={(value) => updateSettings({
              preferences: {
                ...settings.preferences,
                defaultExpirationDays: parseInt(value),
              },
            })}
          >
            <SelectTrigger id="defaultExpirationDays">
              <SelectValue placeholder="Select expiration days" />
            </SelectTrigger>
            <SelectContent>
              {daysOptions.map((days) => (
                <SelectItem key={days} value={String(days)}>
                  {days} {days === 1 ? 'day' : 'days'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Set the default expiration period for new API keys (1-90 days)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
