import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme, type ThemeContextValue } from './theme-context';

// Keep in sync with the inline script in index.html
const THEME_STORAGE_KEY = 'motocompare-theme';
const LIGHT_SCHEME_QUERY = '(prefers-color-scheme: light)';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** The inline script in index.html already resolved the theme (stored choice or system). */
function readInitialTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function hasStoredChoice(): boolean {
  try {
    return isTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return false; // storage blocked (e.g. private mode)
  }
}

function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not persisting is acceptable: the choice still applies to this visit
  }
}

/**
 * Single owner of the theme. Follows the system preference until the user picks a theme;
 * from then on the stored choice wins. Other open tabs follow the change too.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // Layout effect: all layout effects run before any passive effect, so components that read
  // the theme colors in a useEffect (charts) see the new data-theme even though children's
  // effects run before their parents'.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const systemQuery = matchMedia(LIGHT_SCHEME_QUERY);
    const onSystemChange = () => {
      if (!hasStoredChoice()) {
        setTheme(systemQuery.matches ? 'light' : 'dark');
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) {
        setTheme(event.newValue);
      }
    };

    systemQuery.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorage);
    return () => {
      systemQuery.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        storeTheme(next);
        setTheme(next);
      },
    }),
    [theme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
