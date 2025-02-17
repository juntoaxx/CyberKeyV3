'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { ApiKey } from '@/types/api-key';

type ExpiringKey = {
  id: string;
  name: string;
  daysUntilExpiration: number;
};

export type HeaderRef = {
  updateExpiringKeys: (keys: ApiKey[]) => void;
};

// Create a Set to store dismissed warnings across component remounts
const sessionDismissedWarnings = new Set<string>();

export const Header = forwardRef<HeaderRef>((props, ref) => {
  const { user, logout } = useAuth();
  const [expiringKeys, setExpiringKeys] = useState<ExpiringKey[]>([]);
  const [hasUnreadWarnings, setHasUnreadWarnings] = useState(false);

  // Reset session dismissed warnings when user logs out
  useEffect(() => {
    if (!user) {
      sessionDismissedWarnings.clear();
    }
  }, [user]);

  useImperativeHandle(ref, () => ({
    updateExpiringKeys: (keys: ApiKey[]) => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiring = keys
        .filter(key => {
          if (!key.expiresAt || !key.id) return false;
          if (sessionDismissedWarnings.has(key.id)) return false;
          const expirationDate = key.expiresAt.toDate();
          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiration <= 3 && daysUntilExpiration > 0;
        })
        .map(key => ({
          id: key.id!,
          name: key.name,
          daysUntilExpiration: Math.ceil((key.expiresAt!.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        }));

      setExpiringKeys(expiring);
      setHasUnreadWarnings(expiring.length > 0);
    }
  }));

  const handleDropdownOpen = () => {
    setHasUnreadWarnings(false);
  };

  const handleDismissWarning = (keyId: string) => {
    sessionDismissedWarnings.add(keyId);
    setExpiringKeys(prev => prev.filter(key => key.id !== keyId));
    setHasUnreadWarnings(prev => prev && expiringKeys.length > 1);
  };

  return (
    <header className="w-full border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        <div className="flex-1 flex items-center">
          <Link href="/" className="relative w-[240px] h-[80px] -mt-[8px]">
            <Image
              src="/CyberKey.png"
              alt="CyberKey Logo"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left bottom' }}
              priority
            />
          </Link>
          {user && (
            <nav className="ml-4">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mr-4">
                Dashboard
              </Link>
              <Link href="/settings" className="text-muted-foreground hover:text-foreground">
                Settings
              </Link>
            </nav>
          )}
        </div>
        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <DropdownMenu onOpenChange={handleDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {hasUnreadWarnings && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {expiringKeys.length === 0 ? (
                    <DropdownMenuItem className="text-muted-foreground">
                      No expiring API keys
                    </DropdownMenuItem>
                  ) : (
                    expiringKeys.map(key => (
                      <DropdownMenuItem 
                        key={key.id} 
                        className="flex flex-col items-start py-2"
                        onSelect={(e) => {
                          e.preventDefault();
                          handleDismissWarning(key.id);
                        }}
                      >
                        <span className="font-medium">{key.name}</span>
                        <span className="text-sm text-muted-foreground">
                          Expires in {key.daysUntilExpiration} day{key.daysUntilExpiration !== 1 ? 's' : ''}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-muted-foreground">{user.email}</span>
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
});
