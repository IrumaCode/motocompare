import { MotoIllustration } from '../../components/MotoIllustration';
import { Button } from '../../components/ui/Button';

interface CatalogEmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function CatalogEmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-10 text-center">
      <MotoIllustration variant="static" className="h-20 w-36 opacity-80" />
      <p className="text-lg font-semibold">{title}</p>
      <p className="max-w-md text-ink-muted">{message}</p>
      <Button variant="ghost" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
