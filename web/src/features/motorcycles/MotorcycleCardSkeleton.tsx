import { Skeleton } from '../../components/ui/Skeleton';

// Mirrors MotorcycleCard's layout so the page does not jump when data arrives
export function MotorcycleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="flex flex-col p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-12" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
    </div>
  );
}
