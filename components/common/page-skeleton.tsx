import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-3xl lg:col-span-2" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <Skeleton className="h-20 rounded-3xl" />
          <Skeleton className="h-20 rounded-3xl" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:gap-5 md:grid-cols-2">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
