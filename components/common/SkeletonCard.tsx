import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'surface-1 rounded-lg p-4 space-y-3',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-[45%] rounded" />
          <Skeleton className="h-2.5 w-[30%] rounded" />
        </div>
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-[88%] rounded" />
        <Skeleton className="h-3 w-[60%] rounded" />
      </div>
      {/* Footer */}
      <div className="flex items-center gap-3 pt-1">
        <Skeleton className="h-2.5 w-16 rounded" />
        <Skeleton className="h-2.5 w-12 rounded" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
