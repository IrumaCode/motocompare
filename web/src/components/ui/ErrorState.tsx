import { AlertIcon } from '../icons';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-10 text-center"
    >
      <AlertIcon className="text-accent-ink" width={28} height={28} />
      <p className="text-ink-muted">{message}</p>
      <Button onClick={onRetry}>Reintentar</Button>
    </div>
  );
}
