import { Link, NavLink } from 'react-router';
import { MotoIllustration } from '../components/MotoIllustration';
import { ThemeToggle } from './theme/ThemeToggle';

const NAV_ITEMS = [
  // `end`: "Inicio" is only active on "/" itself, not on every page below it
  { to: '/', label: 'Inicio', end: true },
  { to: '/motos', label: 'Catálogo', end: false },
];

// NavLink sets aria-current="page" on the active link; the style reads that same state
const NAV_LINK_CLASSES =
  'inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink-muted transition duration-200 hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8';

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-sm font-bold tracking-widest text-ink uppercase"
        >
          <MotoIllustration variant="mark" className="h-6 w-10" />
          <span className="hidden sm:inline">
            Moto<span className="text-accent-ink">Compare</span>
          </span>
          <span className="sr-only sm:hidden">MotoCompare</span>
        </Link>
        <div className="flex items-center gap-1">
          <nav aria-label="Principal">
            <ul className="flex items-center">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={NAV_LINK_CLASSES}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
