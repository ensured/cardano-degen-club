import { cn } from "@/lib/utils";

export function GradientText({ children, className, ...props }) {
  return (
    <span 
      className={cn(
        "bg-gradient-to-r from-[hsl(276,49%,20%)] via-[hsl(276,30%,42%)] to-[hsl(276,49%,20%)] bg-clip-text text-transparent transition-opacity hover:opacity-80 dark:from-purple-300 dark:to-purple-700",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
} 