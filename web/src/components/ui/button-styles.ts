// Shared by <Button> and by links that must look like buttons (e.g. "Ver comparación").
// A .ts file because react-refresh only allows components to be exported from .tsx files.

export type ButtonVariant = 'primary' | 'ghost';
/** compact: narrower padding for buttons that sit next to others (cards, tray). */
export type ButtonSize = 'regular' | 'compact';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:brightness-110',
  ghost: 'border border-line text-ink hover:bg-surface-2',
};

// Padding lives here, not in `className`: two px-* classes would fight and the one defined
// later in the CSS would win, whatever the order in the attribute.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  regular: 'px-4',
  compact: 'px-3',
};

// min-h-11 = 44px: minimum comfortable touch target
export function buttonClassName(
  variant: ButtonVariant = 'primary',
  className = '',
  size: ButtonSize = 'regular',
): string {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`;
}
