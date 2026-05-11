import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({ count = 5, className }: SkeletonListProps) {
  return (
    <div className={cn('divide-y', className)} style={{ borderColor: 'var(--border)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 px-4">
          <Skeleton className="size-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-[55%] rounded" />
            <Skeleton className="h-2.5 w-[35%] rounded" />
          </div>
          <Skeleton className="h-2.5 w-10 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 py-3 px-4', className)}>
      <Skeleton className="size-7 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-[55%] rounded" />
        <Skeleton className="h-2.5 w-[35%] rounded" />
      </div>
      <Skeleton className="h-2.5 w-10 rounded" />
    </div>
  );
}
