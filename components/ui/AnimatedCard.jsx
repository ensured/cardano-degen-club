/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/no-unescaped-entities */
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"

export function AnimatedCard({ 
  children, 
  className, 
  threshold = 0.2,
  delay = 0,
  duration = 1,
  ...props 
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold,
  })

  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-lg bg-card p-6 text-card-foreground shadow-lg transition-all hover:bg-secondary/50",
        className
      )}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeInOut" 
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Preset configurations
AnimatedCard.Feature = function Feature({ children, className, ...props }) {
  return (
    <AnimatedCard 
      className={cn("h-full", className)} 
      {...props}
    >
      {children}
    </AnimatedCard>
  )
}

AnimatedCard.Content = function Content({ children, className, ...props }) {
  return (
    <AnimatedCard 
      className={cn("mx-auto max-w-3xl", className)} 
      {...props}
    >
      {children}
    </AnimatedCard>
  )
} 