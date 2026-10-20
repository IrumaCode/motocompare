// Original drawing in a "solid silhouette" style: a faired sport bike with a tucked rider.
// Thin cuts painted with the card color (stroke-surface) separate the shapes, like negative space.
// Animations come from index.css and only run with motion-safe: with "reduce motion" enabled
// the motorcycle stands still. The drawing is always decorative (aria-hidden): the text next to
// it carries the meaning.

export type SpeedLevel = 0 | 1 | 2 | 3;

type MotoIllustrationProps = { className?: string } & (
  | { variant: 'animated' }
  /** speedLevel draws that many speed lines behind the bike (power meter). */
  | { variant: 'static'; speedLevel?: SpeedLevel }
  /** Simplified silhouette that stays readable at icon sizes (logo, favicon). */
  | { variant: 'mark' }
);

const SVG_PROPS = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

function Wheel({ cx, spinning }: { cx: number; spinning: boolean }) {
  return (
    <g
      className={
        spinning ? 'origin-center [transform-box:fill-box] motion-safe:animate-wheel-spin' : ''
      }
    >
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

/** Limb drawn twice: a wider card-colored stroke first, so it stands out from the bodywork. */
function Limb({ d, width }: { d: string; width: number }) {
  return (
    <>
      <path d={d} strokeWidth={width + 5} className="stroke-surface" />
      <path d={d} strokeWidth={width} className="stroke-ink" />
    </>
  );
}

function BikeWithRider({ spinning }: { spinning: boolean }) {
  return (
    <>
      <Wheel cx={52} spinning={spinning} />
      <Wheel cx={156} spinning={spinning} />

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
    </>
  );
}

// Loader: three staggered lines that loop at the same pace
const LOADER_SPEED_LINES = [
  { y: 40, delay: '0s' },
  { y: 58, delay: '0.25s' },
  { y: 76, delay: '0.5s' },
];

function AnimatedMoto({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} {...SVG_PROPS}>
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
      {LOADER_SPEED_LINES.map(({ y, delay }) => (
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
        <BikeWithRider spinning />
      </g>
    </svg>
  );
}

// Power meter: more power means more, longer and faster lines
const POWER_SPEED_LINES = [
  { y: 58, delay: '0s' },
  { y: 40, delay: '0.2s' },
  { y: 76, delay: '0.4s' },
];
const LINE_LENGTH: Record<Exclude<SpeedLevel, 0>, number> = { 1: 12, 2: 18, 3: 26 };
const LINE_DURATION: Record<Exclude<SpeedLevel, 0>, string> = { 1: '1.1s', 2: '0.8s', 3: '0.5s' };

function PowerSpeedLines({ level }: { level: Exclude<SpeedLevel, 0> }) {
  return POWER_SPEED_LINES.slice(0, level).map(({ y, delay }) => (
    <line
      key={y}
      x1="2"
      y1={y}
      x2={2 + LINE_LENGTH[level]}
      y2={y}
      strokeWidth="4"
      style={{ animationDelay: delay, animationDuration: LINE_DURATION[level] }}
      className="stroke-accent-ink motion-safe:animate-speed-line"
    />
  ));
}

function StaticMoto({ className, speedLevel }: { className?: string; speedLevel: SpeedLevel }) {
  return (
    <svg viewBox="0 0 200 120" className={className} {...SVG_PROPS}>
      <line x1="4" y1="116" x2="196" y2="116" strokeWidth="4" className="stroke-line" />
      {speedLevel !== 0 && <PowerSpeedLines level={speedLevel} />}
      <BikeWithRider spinning={false} />
    </svg>
  );
}

// Keep public/favicon.svg in sync with this drawing (it repeats it with fixed colors)
function MarkMoto({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} {...SVG_PROPS}>
      <circle cx="13" cy="29" r="7.5" strokeWidth="5" className="stroke-ink" />
      <circle cx="51" cy="29" r="7.5" strokeWidth="5" className="stroke-ink" />
      <path d="M3 13 25 19l6-3q7-4 15-2l15 10q-2 4-8 3H35l-9 4-6-6Z" className="fill-accent" />
      <path d="M26 18q4-8 14-8" strokeWidth="5" className="stroke-ink" />
      <circle cx="44" cy="8" r="5" className="fill-ink" />
    </svg>
  );
}

export function MotoIllustration(props: MotoIllustrationProps) {
  switch (props.variant) {
    case 'animated':
      return <AnimatedMoto className={props.className} />;
    case 'static':
      return <StaticMoto className={props.className} speedLevel={props.speedLevel ?? 0} />;
    case 'mark':
      return <MarkMoto className={props.className} />;
  }
}
