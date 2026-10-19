import { Link } from 'react-router';
import { ThemeToggle } from './theme/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-display text-sm font-bold tracking-widest text-ink uppercase">
          Moto<span className="text-accent-ink">Compare</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
