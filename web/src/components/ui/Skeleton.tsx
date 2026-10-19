// Placeholder block shown while data loads. The pulse only runs when the user allows motion.
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-md bg-surface-2 motion-safe:animate-pulse ${className}`} />;
}
