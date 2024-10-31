import { cn } from "@/lib/utils";

export function GradientText({ children, className, ...props }) {
  return (
    <span 
      className={cn(
        "bg-gradient-to-r from-[hsl(276,49%,20%)] via-[hsl(276,30%,42%)] to-[hsl(276,49%,20%)] bg-clip-text text-transparent transition-opacity hover:opacity-80 dark:from-[hsl(276,70%,60%)] dark:via-[hsl(276,80%,70%)] dark:to-[hsl(276,70%,60%)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
} 