import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

// Keep in sync with the inline script in index.html
const THEME_STORAGE_KEY = 'motocompare-theme';
const LIGHT_SCHEME_QUERY = '(prefers-color-scheme: light)';

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null; // storage blocked (e.g. private mode)
  }
}

function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not persisting is acceptable: the choice still applies to this visit
  }
}

function getSystemTheme(): Theme {
  return matchMedia(LIGHT_SCHEME_QUERY).matches ? 'light' : 'dark';
}

/**
 * Follows the system preference until the user picks a theme; from then on,
 * the stored choice wins.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [choice, setChoice] = useState<Theme | null>(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);
  const theme = choice ?? systemTheme;

  useEffect(() => {
    const query = matchMedia(LIGHT_SCHEME_QUERY);
    const onChange = () => {
      setSystemTheme(getSystemTheme());
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    storeTheme(next);
    setChoice(next);
  }

  return { theme, toggleTheme };
}
