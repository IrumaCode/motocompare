import { ArrowRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

export function HomeHero() {
  return (
    <section className="py-8 sm:py-14">
      <p className="text-xs font-semibold tracking-widest text-balance text-accent-ink uppercase">
        Especificaciones oficiales · Precios en USD y COP
      </p>
      <h1 className="mt-4 font-display text-3xl leading-tight font-bold text-balance uppercase sm:text-5xl">
        Compara motos lado a lado
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-muted">
        Potencia, torque, peso y precio de las motos más populares, con datos verificados y gráficos
        para decidir cuál se ajusta a ti.
      </p>
      <Link
        to="/motos"
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent transition duration-200 hover:brightness-110"
      >
        Ver catálogo
        <ArrowRightIcon size={16} />
      </Link>
    </section>
  );
}
