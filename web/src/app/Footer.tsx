export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-ink-muted sm:px-6">
        <p>
          MotoCompare, proyecto de portafolio de{' '}
          <a
            href="https://sneyderla.dev"
            className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent-ink"
          >
            sneyderla.dev
          </a>
        </p>
        <p>Precios en pesos calculados con la TRM oficial publicada en datos.gov.co.</p>
      </div>
    </footer>
  );
}
