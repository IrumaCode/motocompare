// Original drawing in a "solid silhouette" style: a faired sport bike with a tucked rider.
// Thin cuts painted with the card color (stroke-surface) separate the shapes, like negative space.
// Animations come from index.css and only run with motion-safe: with "reduce motion" enabled
// the motorcycle stands still and the message alone explains the wait.

const SPIN_WHEEL = 'origin-center [transform-box:fill-box] motion-safe:animate-wheel-spin';

function Wheel({ cx }: { cx: number }) {
  return (
    <g className={SPIN_WHEEL}>
      <circle cx={cx} cy="88" r="21" strokeWidth="8" className="stroke-ink" />
      {/* dashed rim: the gaps make the rotation visible */}
      <circle
        cx={cx}
        cy="88"
        r="12"
        strokeWidth="4"
        strokeDasharray="13 6"
        className="stroke-ink-muted"
      />
      <circle cx={cx} cy="88" r="4" className="fill-ink" />
    </g>
  );
}

const SPEED_LINES = [
  { y: 40, delay: '0s' },
  { y: 58, delay: '0.25s' },
  { y: 76, delay: '0.5s' },
];

/** Limb drawn twice: a wider card-colored stroke first, so it stands out from the bodywork. */
function Limb({ d, width }: { d: string; width: number }) {
  return (
    <>
      <path d={d} strokeWidth={width + 5} className="stroke-surface" />
      <path d={d} strokeWidth={width} className="stroke-ink" />
    </>
  );
}

function RacingMotorcycle() {
  return (
    <svg
      viewBox="0 0 200 120"
      className="h-28 w-48"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* road: the dash period (14 + 10) must match the `road` keyframes offset */}
      <line
        x1="4"
        y1="116"
        x2="196"
        y2="116"
        strokeWidth="4"
        strokeDasharray="14 10"
        className="stroke-line motion-safe:animate-road"
      />
      {SPEED_LINES.map(({ y, delay }) => (
        <line
          key={y}
          x1="2"
          y1={y}
          x2="22"
          y2={y}
          strokeWidth="4"
          style={{ animationDelay: delay }}
          className="stroke-ink-muted motion-safe:animate-speed-line"
        />
      ))}

      <g className="motion-safe:animate-ride-bounce">
        <Wheel cx={52} />
        <Wheel cx={156} />

        {/* swingarm and fork */}
        <path d="M52 88 98 82M146 58l10 30" strokeWidth="7" className="stroke-ink" />

        {/* fairing: tail, seat, tank, windscreen, nose and belly pan */}
        <path
          d="M30 40 86 56l18-7q18-9 38-6l38 27q-6 9-20 8l-12-3-14 17-32 2-18-14Z"
          strokeWidth="2"
          className="fill-accent stroke-accent"
        />
        {/* negative-space cuts on the fairing, plus the headlight */}
        <path
          d="M40 45l40 12M112 66h44M118 82l28-10M158 60l12 8"
          strokeWidth="3"
          className="stroke-surface"
        />

        {/* rider: leg, torso and arm drawn as thick strokes, then the helmet */}
        <Limb d="M90 56 112 68 98 84" width={10} />
        <Limb d="M88 54 C96 38 108 30 124 32" width={14} />
        <Limb d="M120 38 134 46 146 50" width={8} />
        <circle cx="132" cy="22" r="12" strokeWidth="4" className="fill-ink stroke-surface" />
        {/* visor */}
        <path d="M131 19h12l-2 7h-9Z" className="fill-surface" />
      </g>
    </svg>
  );
}

export function ColdStartNotice() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-8 text-center">
      <RacingMotorcycle />
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
