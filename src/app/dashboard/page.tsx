'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { redirect } from 'next/navigation';
import { getUserApiKeys, deleteApiKey, createApiKey, deleteExpiredKeys, updateApiKeyBalance, updateApiKey } from '@/services/api-keys';
import { checkBalance } from '@/services/balance';
import type { ApiKey } from '@/types/api-key';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header, HeaderRef } from '@/components/layout/header';
import { Loader2, RefreshCcw, ChevronDown, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@/components/ui/form';
import { ConcealedApiKey } from '@/components/ui/concealed-api-key';
import { toast } from 'react-hot-toast';
import { useSettings } from '@/contexts/settings-context';

// Create a Set to store dismissed toast warnings across component remounts
const sessionDismissedToasts = new Set<string>();

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [balances, setBalances] = useState<Record<string, any>>({});
  const [loadingBalances, setLoadingBalances] = useState<Record<string, boolean>>({});
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    providerName: '',
    key: '',
    fundingLink: '',
    expiresInDays: '30',
  });
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState<string>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);
  const headerRef = useRef<HeaderRef>(null);

  useEffect(() => {
    if (settings?.preferences.defaultExpirationDays) {
      setNewKeyData(prev => ({
        ...prev,
        expiresInDays: settings.preferences.defaultExpirationDays.toString()
      }));
    }
  }, [settings?.preferences.defaultExpirationDays]);

  useEffect(() => {
    // Only fetch keys when auth is done loading and we have a user
    if (!authLoading) {
      if (user) {
        fetchKeys();
      } else {
        redirect('/login');
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Reset session dismissed toasts when user changes
    if (!user) {
      sessionDismissedToasts.clear();
    }
  }, [user]);

  useEffect(() => {
    // Check for keys expiring soon
    const checkExpiringKeys = () => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      apiKeys.forEach(key => {
        if (key.expiresAt && key.id && !dismissedWarnings.includes(key.id) && !sessionDismissedToasts.has(key.id)) {
          const expirationDate = key.expiresAt.toDate();
          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiration <= 3 && daysUntilExpiration > 0) {
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        API Key Expiring Soon
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {key.name} will expire in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => {
                      if (key.id) {
                        setDismissedWarnings(prev => [...prev, key.id!]);
                        sessionDismissedToasts.add(key.id);
                      }
                      toast.dismiss(t.id);
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ), {
              duration: 5000,
              position: 'top-center',
            });
          }
        }
      });
    };

    if (apiKeys.length > 0) {
      checkExpiringKeys();
    }
  }, [apiKeys, dismissedWarnings]);

  useEffect(() => {
    if (apiKeys.length > 0 && headerRef.current) {
      headerRef.current.updateExpiringKeys(apiKeys);
    }
  }, [apiKeys]);

  const fetchKeys = async () => {
    if (!user) {
      console.error('No user found');
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userKeys = await getUserApiKeys(user.uid);
      console.log(`Found ${userKeys.length} API keys`);
      
      if (userKeys.length === 0) {
        console.log('No API keys found');
      }
      
      setApiKeys(userKeys);
      
      // Initialize balances state with stored balances
      const initialBalances: Record<string, any> = {};
      userKeys.forEach(key => {
        if (key.id && key.balance !== undefined) {
          initialBalances[key.id] = {
            status: 'success',
            balance: key.balance
          };
        }
      });
      setBalances(initialBalances);
    } catch (error) {
      console.error('Error fetching keys:', error);
      setError('Failed to fetch API keys. Please try again.');
      toast.error('Failed to fetch API keys. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!user) {
      console.error('No user found');
      toast.error('You must be logged in to create keys');
      return;
    }

    if (isCreating) {
      console.log('Already processing a key creation request');
      return;
    }

    const formData = {
      name: newKeyData.name.trim(),
      key: newKeyData.key.trim(),
      providerName: newKeyData.providerName.trim(),
      fundingLink: newKeyData.fundingLink.trim(),
    };

    if (!formData.name || !formData.key || !formData.providerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      console.log('Creating new API key...');

      const expirationDays = parseInt(newKeyData.expiresInDays);
      if (isNaN(expirationDays) || expirationDays < 1 || expirationDays > 365) {
        throw new Error('Invalid expiration days. Must be between 1 and 365.');
      }

      const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

      const result = await createApiKey({
        name: formData.name,
        key: formData.key,
        providerName: formData.providerName,
        userId: user.uid,
        fundingLink: formData.fundingLink || undefined,
        expiresAt
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      await fetchKeys();
      setIsCreateDialogOpen(false);
      setNewKeyData({
        name: '',
        providerName: '',
        key: '',
        fundingLink: '',
        expiresInDays: '30',
      });

      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create API key: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!user) return;
    try {
      await deleteApiKey(keyId);
      fetchKeys();
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const handleCheckBalance = async (key: ApiKey) => {
    if (!key.id || !key.key || loadingBalances[key.id]) {
      console.log('Skipping balance check - invalid state');
      return;
    }

    setLoadingBalances(prev => ({ ...prev, [key.id!]: true }));
    try {
      console.log(`Checking balance for key ${key.id}`);
      
      const balance = await checkBalance(key.key);
      console.log('Balance check completed');
      
      // If the API check is successful, update the stored balance
      if (balance.status === 'success' && typeof balance.balance === 'number') {
        await updateApiKeyBalance(key.id, balance.balance);
        
        // Update the API key in the list with the new balance
        setApiKeys(prev => prev.map(k => 
          k.id === key.id 
            ? { ...k, balance: balance.balance }
            : k
        ));
      }
      
      setBalances(prev => ({ ...prev, [key.id!]: balance }));
    } catch (error) {
      console.error('Error checking balance:', error);
      // If API check fails, use the stored balance from the key
      setBalances(prev => ({ 
        ...prev, 
        [key.id!]: { 
          status: 'success', 
          balance: key.balance || 0 
        }
      }));
      if (error instanceof Error && error.message.includes('Network error')) {
        toast.error(error.message);
      }
    } finally {
      setLoadingBalances(prev => ({ ...prev, [key.id!]: false }));
    }
  };

  const handleBalanceEdit = async (keyId: string, currentBalance: number) => {
    setEditingBalance(keyId);
    setNewBalance(currentBalance.toString());
  };

  const handleBalanceUpdate = async (keyId: string) => {
    try {
      const balanceValue = parseFloat(newBalance);
      if (isNaN(balanceValue)) {
        toast.error('Please enter a valid number');
        return;
      }

      const result = await updateApiKeyBalance(keyId, balanceValue);
      if (result.error) {
        throw new Error(result.error);
      }

      // Update the local state with the new balance
      setBalances(prev => ({
        ...prev,
        [keyId]: { status: 'success', balance: balanceValue }
      }));

      // Update the API key in the list with the new balance
      setApiKeys(prev => prev.map(key => 
        key.id === keyId 
          ? { ...key, balance: balanceValue }
          : key
      ));

      toast.success('Balance updated successfully');
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update balance');
    } finally {
      setEditingBalance(null);
      setNewBalance('');
    }
  };

  const handleEditKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingKey?.id || isEditing) return;

    setIsEditing(true);
    try {
      const result = await updateApiKey(editingKey.id, {
        name: editingKey.name.trim(),
        key: editingKey.key.trim(),
        providerName: editingKey.providerName.trim(),
        fundingLink: editingKey.fundingLink.trim(),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      await fetchKeys();
      setIsEditDialogOpen(false);
      setEditingKey(null);
      toast.success('API key updated successfully');
    } catch (error) {
      console.error('Error updating key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update API key: ${errorMessage}`);
    } finally {
      setIsEditing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header ref={headerRef} />
        <main className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchKeys}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header ref={headerRef} />
        <main className="container mx-auto p-4">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header ref={headerRef} />
        <main className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">API Keys</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Add New Key
            </Button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No API keys found. Add your first key to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apiKeys.map((key) => (
                <Card key={key.id} className="bg-card">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-semibold truncate">{key.name}</h3>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setEditingKey(key);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <span className="sr-only">Edit</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:text-destructive"
                            onClick={() => handleDeleteKey(key.id!)}
                          >
                            <span className="sr-only">Delete</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span>Provider: {key.providerName}</span>
                        {key.expiresAt && (
                          <span>Expires: {key.expiresAt.toDate().toLocaleDateString()}</span>
                        )}
                      </div>

                      {key.key && (
                        <ConcealedApiKey 
                          apiKey={key.key} 
                          className="mt-1" 
                        />
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span>Balance:</span>
                          {editingBalance === key.id ? (
                            <div className="flex items-center space-x-1">
                              <Input
                                type="number"
                                value={newBalance}
                                onChange={(e) => setNewBalance(e.target.value)}
                                className="w-20 h-7"
                                step="0.01"
                                min="0"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleBalanceUpdate(key.id!);
                                  } else if (e.key === 'Escape') {
                                    setEditingBalance(null);
                                    setNewBalance('');
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleBalanceUpdate(key.id!)}
                                className="h-7"
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleBalanceEdit(
                                key.id!,
                                key.id && typeof balances === 'object' && balances !== null && key.id in balances
                                  ? balances[key.id as keyof typeof balances].balance 
                                  : key.balance || 0
                              )}
                              className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
                            >
                              ${(key.id && typeof balances === 'object' && balances !== null && key.id in balances
                                ? balances[key.id as keyof typeof balances].balance 
                                : key.balance || 0).toFixed(2)}
                            </button>
                          )}
                        </div>
                        {key.fundingLink ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => window.open(key.fundingLink, '_blank', 'noopener,noreferrer')}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Add Funds
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={loadingBalances[key.id || '']}
                            className="h-7"
                            onClick={() => handleCheckBalance(key)}
                          >
                            {loadingBalances[key.id || ''] ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Checking...
                              </>
                            ) : (
                              <>
                                <RefreshCcw className="mr-1 h-3 w-3" />
                                Check
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New API Key</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newKeyData.name}
                      onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                      placeholder="Enter a name for this key"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="providerName">Provider Name</Label>
                    <Input
                      id="providerName"
                      value={newKeyData.providerName}
                      onChange={(e) => setNewKeyData({ ...newKeyData, providerName: e.target.value })}
                      placeholder="Enter the provider name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="key">API Key</Label>
                    <Input
                      id="key"
                      value={newKeyData.key}
                      onChange={(e) => setNewKeyData({ ...newKeyData, key: e.target.value })}
                      placeholder="Enter the API key"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expiration">Expires In (Days)</Label>
                    <Input
                      id="expiration"
                      type="number"
                      min="1"
                      max="365"
                      value={newKeyData.expiresInDays}
                      onChange={(e) => setNewKeyData({ ...newKeyData, expiresInDays: e.target.value })}
                      placeholder="Number of days until expiration"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fundingLink">Funding Link (Optional)</Label>
                    <Input
                      id="fundingLink"
                      value={newKeyData.fundingLink}
                      onChange={(e) => setNewKeyData({ ...newKeyData, fundingLink: e.target.value })}
                      placeholder="Enter the funding link (optional)"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isCreating || !newKeyData.name.trim() || !newKeyData.providerName.trim() || !newKeyData.key.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Key'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit API Key</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditKey} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editingKey?.name || ''}
                      onChange={(e) => setEditingKey(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Enter a name for this key"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-providerName">Provider Name</Label>
                    <Input
                      id="edit-providerName"
                      value={editingKey?.providerName || ''}
                      onChange={(e) => setEditingKey(prev => prev ? { ...prev, providerName: e.target.value } : null)}
                      placeholder="Enter the provider name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-key">API Key</Label>
                    <Input
                      id="edit-key"
                      value={editingKey?.key || ''}
                      onChange={(e) => setEditingKey(prev => prev ? { ...prev, key: e.target.value } : null)}
                      placeholder="Enter the API key"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-fundingLink">Funding Link (Optional)</Label>
                    <Input
                      id="edit-fundingLink"
                      value={editingKey?.fundingLink || ''}
                      onChange={(e) => setEditingKey(prev => prev ? { ...prev, fundingLink: e.target.value } : null)}
                      placeholder="Enter the funding link (optional)"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingKey(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isEditing || !editingKey?.name.trim() || !editingKey?.providerName.trim() || !editingKey?.key.trim()}
                  >
                    {isEditing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </>
  );
}
