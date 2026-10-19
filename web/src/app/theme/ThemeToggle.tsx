import { MoonIcon, SunIcon } from '../../components/icons';
import { useTheme } from './theme-context';

// A switch, not a plain button: role="switch" + aria-checked tell screen readers it is on/off.
// The outer button keeps a 44px touch target; the visible track is smaller.
// Thumb travel: 54px inner track - 2px gap on each side - 28px thumb = 22px.
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
      className="group inline-flex h-11 cursor-pointer items-center rounded-full px-1"
    >
      <span className="relative inline-flex h-8 w-14 items-center rounded-full border border-ink-muted/50 bg-surface-2 transition-colors duration-200 group-hover:border-ink-muted">
        <SunIcon className="absolute left-2 size-3.5 text-ink-muted" />
        <MoonIcon className="absolute right-2 size-3.5 text-ink-muted" />
        <span
          className={`absolute left-0.5 inline-flex size-7 items-center justify-center rounded-full bg-accent text-on-accent shadow-sm motion-safe:transition-transform motion-safe:duration-200 ${isDark ? 'translate-x-[22px]' : 'translate-x-0'}`}
        >
          {isDark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
        </span>
      </span>
    </button>
  );
}
