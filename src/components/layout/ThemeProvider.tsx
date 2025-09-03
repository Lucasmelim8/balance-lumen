import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { useUserProfile } from '@/hooks/useUserProfile';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'finance-app-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      <ThemeSync>
        {children}
      </ThemeSync>
    </NextThemesProvider>
  );
}

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile } = useUserProfile();
  const { theme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme from profile when it loads
  useEffect(() => {
    if (mounted && profile?.theme && profile.theme !== theme) {
      setTheme(profile.theme);
    }
  }, [profile?.theme, theme, setTheme, mounted]);

  // Save theme changes to profile
  useEffect(() => {
    if (mounted && profile && theme && theme !== profile.theme) {
      updateProfile({ theme: theme as 'light' | 'dark' | 'system' });
    }
  }, [theme, profile, updateProfile, mounted]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export const useTheme = useNextTheme;