import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="flex flex-col items-center gap-4 py-20 text-center">
      <title>Página no encontrada · MotoCompare</title>
      <p className="font-display text-5xl font-bold text-accent-ink">404</p>
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="text-ink-muted">La dirección que buscas no existe o cambió.</p>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition duration-200 hover:brightness-110"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
