import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-8 rounded-md animate-pulse bg-slate-50", className)}
      {...props}
    />
  )
}

export { Skeleton }
