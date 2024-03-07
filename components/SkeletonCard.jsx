import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <div className="flex flex-col justify-center items-center">
      <Skeleton className={cn(" h-10 w-64 ")} />
    </div>
  )
}
