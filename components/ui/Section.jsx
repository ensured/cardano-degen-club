import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function Section({ 
  children, 
  className, 
  variant = "default", // Options: "default", "grid", "gradient"
  delay = 0,
  ...props 
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  const backgrounds = {
    default: "bg-gray-100 dark:bg-gray-800",
    grid: "bg-slate-100 dark:bg-slate-900 relative",
    gradient: "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative",
  }

  const overlays = {
    grid: (
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
    ),
    gradient: (
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    ),
  }

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "py-24 shadow-lg",
        backgrounds[variant],
        className
      )}
      {...props}
    >
      {overlays[variant]}
      <div className="relative md:container mx-auto px-6">
        {children}
      </div>
    </motion.section>
  )
} 