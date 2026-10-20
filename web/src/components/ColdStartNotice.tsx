import { MotoIllustration } from './MotoIllustration';

export function ColdStartNotice() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-8 text-center">
      <MotoIllustration variant="animated" className="h-28 w-48" />
      <p className="font-display text-sm font-bold tracking-widest uppercase">
        Calentando motores…
      </p>
      <p className="max-w-md text-ink-muted">
        Espera unos segundos mientras llegan las motos. Si el servidor estaba en reposo, la primera
        carga puede tardar hasta un minuto.
      </p>
    </div>
  );
}
