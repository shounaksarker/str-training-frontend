import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8" aria-label="Loading training dashboard">
      <Skeleton className="h-56 rounded-[28px]" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="mt-12 h-8 w-52" />
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-88 rounded-2xl" />)}
      </div>
    </main>
  );
}
