'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { Header } from '@/components/layout/header';

export default function SmtpSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const [isTesting, setIsTesting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [smtpConfig, setSmtpConfig] = useState({
    host: settings?.notifications.smtpSettings?.host || '',
    port: settings?.notifications.smtpSettings?.port || 587,
    secure: settings?.notifications.smtpSettings?.secure || false,
    username: settings?.notifications.smtpSettings?.username || '',
    password: settings?.notifications.smtpSettings?.password || '',
    fromEmail: settings?.notifications.smtpSettings?.fromEmail || ''
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleTestEmail = async () => {
    if (!user?.email) {
      toast.error('No user email found');
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: smtpConfig,
          to: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      toast.success('Test email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email. Please check your SMTP settings.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateSettings({
        notifications: {
          emailEnabled: true,
          browserEnabled: settings?.notifications.browserEnabled ?? false,
          daysBeforeExpiration: settings?.notifications.daysBeforeExpiration ?? 3,
          balanceAlerts: settings?.notifications.balanceAlerts ?? false,
          lowBalanceThreshold: settings?.notifications.lowBalanceThreshold ?? 10,
          notificationFrequency: settings?.notifications.notificationFrequency ?? 'daily',
          smtpSettings: smtpConfig
        }
      });
      toast.success('SMTP settings saved successfully');
      router.push('/settings');
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast.error('Failed to save SMTP settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const isConfigValid = smtpConfig.host && 
    smtpConfig.port && 
    smtpConfig.username && 
    smtpConfig.password && 
    smtpConfig.fromEmail;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/settings')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">SMTP Settings</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Server Configuration</CardTitle>
            <CardDescription>
              Configure your SMTP server for sending email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="host">SMTP Host</Label>
                <Input
                  id="host"
                  placeholder="smtp.example.com"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="587"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) || 587 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="secure"
                  checked={smtpConfig.secure}
                  onCheckedChange={(checked) => setSmtpConfig({ ...smtpConfig, secure: checked })}
                />
                <Label htmlFor="secure">Use SSL/TLS</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="your-username"
                  value={smtpConfig.username}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="your-password"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="noreply@example.com"
                  value={smtpConfig.fromEmail}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={!isConfigValid || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save & Enable Email Notifications'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleTestEmail}
                disabled={!isConfigValid || isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Test Email'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
