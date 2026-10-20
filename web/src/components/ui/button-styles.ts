// Shared by <Button> and by links that must look like buttons (e.g. "Ver comparación").
// A .ts file because react-refresh only allows components to be exported from .tsx files.

export type ButtonVariant = 'primary' | 'ghost';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:brightness-110',
  ghost: 'border border-line text-ink hover:bg-surface-2',
};

// min-h-11 = 44px: minimum comfortable touch target
export function buttonClassName(variant: ButtonVariant = 'primary', className = ''): string {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`;
}
