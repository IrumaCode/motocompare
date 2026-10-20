// Runs before every web test file (see `test.setupFiles` in vite.config.ts).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom has no matchMedia. The app reads it for the system theme and for reduced motion; a
// stub that never matches stands for "dark theme, motion allowed".
vi.stubGlobal('matchMedia', (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  addListener: () => undefined,
  removeListener: () => undefined,
  dispatchEvent: () => false,
}));

afterEach(() => {
  // Without `globals: true`, Testing Library cannot register its own cleanup
  cleanup();
  // The comparison tray and the theme persist here: every test starts from scratch
  localStorage.clear();
});
