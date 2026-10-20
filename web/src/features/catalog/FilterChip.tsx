interface FilterChipProps {
  label: string;
  pressed: boolean;
  onToggle: () => void;
}

/** Toggle button: aria-pressed tells screen readers whether the filter is on. */
export function FilterChip({ label, pressed, onToggle }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition duration-200 ${
        pressed
          ? 'border-accent bg-accent text-on-accent'
          : 'border-line bg-surface text-ink hover:border-ink-muted'
      }`}
    >
      {label}
    </button>
  );
}
