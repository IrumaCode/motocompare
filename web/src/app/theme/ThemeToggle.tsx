import { MoonIcon, SunIcon } from '../../components/icons';
import { useTheme } from './theme-context';

// A switch, not a plain button: role="switch" + aria-checked tell screen readers it is on/off.
// The outer button keeps a 44px touch target; the visible track is smaller.
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Modo oscuro"
      onClick={toggleTheme}
      className="inline-flex h-11 cursor-pointer items-center rounded-full px-1"
    >
      <span className="relative inline-flex h-8 w-14 items-center rounded-full border border-line bg-surface-2">
        <SunIcon className="absolute left-2 size-3.5 text-ink-muted" />
        <MoonIcon className="absolute right-2 size-3.5 text-ink-muted" />
        <span
          className={`absolute left-0.5 inline-flex size-7 items-center justify-center rounded-full bg-accent text-on-accent shadow-sm motion-safe:transition-transform motion-safe:duration-200 ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
        >
          {isDark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
        </span>
      </span>
    </button>
  );
}
