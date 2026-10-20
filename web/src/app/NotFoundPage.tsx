import { Link } from 'react-router';
import { MotoIllustration } from '../components/MotoIllustration';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  action?: { to: string; label: string };
}

export function NotFoundPage({
  title = 'Página no encontrada',
  message = 'La dirección que buscas no existe o cambió.',
  action = { to: '/', label: 'Volver al inicio' },
}: NotFoundPageProps) {
  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center">
      <title>{`${title} · MotoCompare`}</title>
      <MotoIllustration variant="static" className="h-24 w-40 opacity-80" />
      <p className="font-display text-5xl font-bold text-accent-ink">404</p>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-ink-muted">{message}</p>
      <Link
        to={action.to}
        className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition duration-200 hover:brightness-110"
      >
        {action.label}
      </Link>
    </section>
  );
}
