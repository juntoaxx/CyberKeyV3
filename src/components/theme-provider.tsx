'use client';

import { useEffect } from 'react';
import { useSettings } from '@/contexts/settings-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  
  useEffect(() => {
    const theme = settings?.preferences.theme || 'system';
    
    const applyTheme = (selectedTheme: string) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (selectedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(selectedTheme);
      }
    };

    applyTheme(theme);

    // Listen for system theme changes if using system preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleThemeChange = (e: MediaQueryListEvent) => {
        applyTheme('system');
      };

      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, [settings?.preferences.theme]);

  return <>{children}</>;
}
