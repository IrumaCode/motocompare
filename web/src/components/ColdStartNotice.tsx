// Animations come from index.css and only run with motion-safe: with "reduce motion"
// enabled the motorcycle is drawn standing still and the message alone explains the wait.

const SPIN_WHEEL = 'origin-center [transform-box:fill-box] motion-safe:animate-wheel-spin';

function Wheel({ cx }: { cx: number }) {
  return (
    <g className={SPIN_WHEEL}>
      <circle cx={cx} cy="50" r="13" />
      <circle cx={cx} cy="50" r="3" />
      <path d={`M${String(cx)} 37v26M${String(cx - 13)} 50h26`} />
    </g>
  );
}

const SPEED_LINES = [
  { y: 24, delay: '0s' },
  { y: 34, delay: '0.25s' },
  { y: 44, delay: '0.5s' },
];

function RacingMotorcycle() {
  return (
    <svg
      viewBox="0 0 140 70"
      className="h-24 w-48"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <line
        x1="0"
        y1="66"
        x2="140"
        y2="66"
        strokeDasharray="10 10"
        className="stroke-line motion-safe:animate-road"
      />
      {SPEED_LINES.map(({ y, delay }) => (
        <line
          key={y}
          x1="2"
          y1={y}
          x2="18"
          y2={y}
          style={{ animationDelay: delay }}
          className="stroke-ink-muted motion-safe:animate-speed-line"
        />
      ))}

      <g className="motion-safe:animate-ride-bounce">
        <g className="stroke-ink">
          <Wheel cx={34} />
          <Wheel cx={106} />
        </g>
        {/* swingarm, exhaust, fork and front fender */}
        <path
          d="M34 50 54 42M60 46 38 42M106 50 92 22M96 37q10-6 20 2"
          className="stroke-ink-muted"
        />
        {/* bodywork: tail, seat, tank, steering head and engine */}
        <path
          d="M12 26 44 29q8-7 16-8l18-1q6 1 8 7l-6 17-24 2-6-7-26-6Z"
          className="fill-accent stroke-accent"
        />
        {/* rider tucked behind the fairing: leg, torso, arm and helmet */}
        <path d="M48 27 60 36 58 44M48 26 70 16 88 20" className="stroke-ink" />
        <circle cx="77" cy="10" r="6" className="fill-ink stroke-ink" />
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
