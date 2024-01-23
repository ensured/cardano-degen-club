import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  console.log(className)
  return (
    <div
      className={cn("animate-pulse bg-slate-900 w-48 h-48 mt-8", className)}
      {...props}
    />
  )
}

export { Skeleton }
