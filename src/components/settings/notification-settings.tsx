import React, { useState, useEffect } from 'react'
import { useSettings } from '@/contexts/settings-context'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/auth-context'

export const NotificationSettings = () => {
  const { settings, updateSettings } = useSettings()
  const { user } = useAuth()
  const [isSmtpDialogOpen, setIsSmtpDialogOpen] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: ''
  })

  // Update SMTP config when dialog opens or settings change
  useEffect(() => {
    if (isSmtpDialogOpen && settings?.notifications.smtpSettings) {
      setSmtpConfig({
        host: settings.notifications.smtpSettings.host || '',
        port: settings.notifications.smtpSettings.port || 587,
        secure: settings.notifications.smtpSettings.secure || false,
        username: settings.notifications.smtpSettings.username || '',
        password: settings.notifications.smtpSettings.password || '',
        fromEmail: settings.notifications.smtpSettings.fromEmail || ''
      })
    }
  }, [isSmtpDialogOpen, settings?.notifications.smtpSettings])

  // Reset SMTP config when dialog closes
  const handleDialogChange = (open: boolean) => {
    setIsSmtpDialogOpen(open)
    if (!open) {
      setSmtpConfig({
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromEmail: ''
      })
    }
  }

  const handleToggle = async (key: string, value: boolean) => {
    if (!settings?.notifications) return
    
    if (key === 'emailEnabled' && value && !settings.notifications.smtpSettings) {
      setIsSmtpDialogOpen(true)
      return
    }
    
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    })
  }

  const handleTestEmail = async () => {
    const emailToUse = settings?.notifications.notificationEmail || user?.email;
    if (!emailToUse) {
      toast.error('No email address configured');
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
          settings: settings?.notifications.smtpSettings,
          to: emailToUse,
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

  const handleSaveSmtp = async () => {
    setIsUpdating(true)
    try {
      await updateSettings({
        notifications: {
          ...settings?.notifications,
          emailEnabled: true,
          browserEnabled: settings?.notifications.browserEnabled ?? false,
          daysBeforeExpiration: settings?.notifications.daysBeforeExpiration ?? 3,
          balanceAlerts: settings?.notifications.balanceAlerts ?? false,
          lowBalanceThreshold: settings?.notifications.lowBalanceThreshold ?? 10,
          notificationFrequency: settings?.notifications.notificationFrequency ?? 'daily',
          smtpSettings: smtpConfig
        }
      })
      setIsSmtpDialogOpen(false)
      toast.success('SMTP settings saved successfully')
    } catch (error) {
      console.error('Error saving SMTP settings:', error)
      toast.error('Failed to save SMTP settings')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDisableSmtp = async () => {
    setIsUpdating(true)
    try {
      await updateSettings({
        notifications: {
          ...settings?.notifications,
          emailEnabled: false,
          browserEnabled: settings?.notifications.browserEnabled ?? false,
          daysBeforeExpiration: settings?.notifications.daysBeforeExpiration ?? 3,
          balanceAlerts: settings?.notifications.balanceAlerts ?? false,
          lowBalanceThreshold: settings?.notifications.lowBalanceThreshold ?? 10,
          notificationFrequency: settings?.notifications.notificationFrequency ?? 'daily',
          smtpSettings: settings?.notifications.smtpSettings
        }
      })
      toast.success('Email notifications disabled')
    } catch (error) {
      console.error('Error disabling SMTP:', error)
      toast.error('Failed to disable email notifications')
    } finally {
      setIsUpdating(false)
    }
  }

  const isConfigValid = smtpConfig.host && 
    smtpConfig.port && 
    smtpConfig.username && 
    smtpConfig.password && 
    smtpConfig.fromEmail

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important events
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings?.notifications.emailEnabled ?? false}
                onCheckedChange={(checked) => handleToggle('emailEnabled', checked)}
              />
            </div>
          </div>

          {settings?.notifications.emailEnabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <div className="flex space-x-2">
                  <Input
                    id="notificationEmail"
                    type="email"
                    placeholder={user?.email || 'Enter email address'}
                    value={settings.notifications.notificationEmail || ''}
                    onChange={(e) => {
                      updateSettings({
                        notifications: {
                          ...settings.notifications,
                          notificationEmail: e.target.value
                        }
                      });
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleTestEmail}
                    disabled={isTesting || !settings.notifications.smtpSettings}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Email address where notifications will be sent
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daysBeforeExpiration">Days Before Expiration</Label>
                <Input
                  id="daysBeforeExpiration"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.notifications.daysBeforeExpiration || 3}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= 30) {
                      updateSettings({
                        notifications: {
                          ...settings.notifications,
                          daysBeforeExpiration: value
                        }
                      });
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Start sending notifications this many days before an API key expires (1-30 days)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="balanceAlerts">Balance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your balance is low
                    </p>
                  </div>
                  <Switch
                    id="balanceAlerts"
                    checked={settings?.notifications.balanceAlerts ?? false}
                    onCheckedChange={(checked) => handleToggle('balanceAlerts', checked)}
                  />
                </div>

                {settings?.notifications.balanceAlerts && (
                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label htmlFor="lowBalanceThreshold">Low Balance Threshold</Label>
                      <Input
                        id="lowBalanceThreshold"
                        type="number"
                        min="0"
                        step="0.01"
                        value={settings?.notifications.lowBalanceThreshold || 10}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            updateSettings({
                              notifications: {
                                ...settings.notifications,
                                lowBalanceThreshold: value,
                              },
                            });
                          }
                        }}
                      />
                      <p className="text-sm text-muted-foreground">
                        You will be notified when your balance falls below this amount
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notificationFrequency">Notification Frequency</Label>
                      <Select
                        value={settings?.notifications.notificationFrequency || 'daily'}
                        onValueChange={(value) => {
                          updateSettings({
                            notifications: {
                              ...settings.notifications,
                              notificationFrequency: value as 'hourly' | 'daily' | 'weekly',
                            },
                          });
                        }}
                      >
                        <SelectTrigger id="notificationFrequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Once Daily</SelectItem>
                          <SelectItem value="weekly">Once Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        How often you'll receive notifications when balance is below threshold
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">SMTP Status</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.notifications.smtpSettings 
                      ? `Configured (${settings.notifications.smtpSettings.host})`
                      : 'Not configured'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSmtpDialogOpen(true)}
                  >
                    {settings.notifications.smtpSettings ? 'Edit SMTP' : 'Configure SMTP'}
                  </Button>
                  {settings.notifications.smtpSettings && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleDisableSmtp}
                        disabled={isUpdating}
                      >
                        Disable SMTP
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSmtpDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure SMTP Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="host">SMTP Host</Label>
              <Input
                id="host"
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                placeholder="smtp.example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={smtpConfig.port}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) || 587 })}
                placeholder="587"
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
                value={smtpConfig.username}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                placeholder="your-username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={smtpConfig.password}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                placeholder="your-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={smtpConfig.fromEmail}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                placeholder="noreply@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSmtpDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSmtp}
              disabled={!isConfigValid || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
