import { MoonIcon, SunIcon } from '../../components/icons';
import { useTheme } from './theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Modo oscuro"
      aria-pressed={isDark}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
