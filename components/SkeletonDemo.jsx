import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonDemo({ count = 30 }) {
  return (
    <div className="mt-4 flex flex-row flex-wrap justify-center gap-2">
      {Array.from({ length: count }, () => (
        <Skeleton className="rounded-lg flex justify-center items-center">
          <span className="text-2xl">🚀</span>
        </Skeleton>
      ))}
    </div>
  )
}
