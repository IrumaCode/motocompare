import { Skeleton } from '../../components/ui/Skeleton';

// Mirrors MotorcycleCard's layout so the page does not jump when data arrives
export function MotorcycleCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-6 w-40" />
      <Skeleton className="mt-2 h-4 w-28" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <div className="mt-4 border-t border-line pt-4">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-1 h-4 w-32" />
      </div>
    </div>
  );
}
