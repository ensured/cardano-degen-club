/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/no-unescaped-entities */
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const sectionVariants = {
  default: {
    className: 'bg-background',
    overlay: null,
  },
  grid: {
    className: 'bg-slate-50 dark:bg-slate-900/50 relative',
    overlay: (
      <div className="bg-grid-slate-100/[0.8] dark:bg-grid-slate-700/[0.2] absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
    ),
  },
  gradient: {
    className:
      'bg-gradient-to-br from-background via-muted to-background dark:from-background dark:via-muted dark:to-background relative',
    overlay: (
      <div className="absolute inset-0 scroll-smooth bg-[linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[length:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    ),
  },
}

export function Section({
  children,
  className,
  variant = 'default',
  delay = 0,
  threshold = 0.2,
  containerClassName,
  ...props
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold,
  })

  const selectedVariant = sectionVariants[variant]

  return (
    <section ref={ref} className={cn('relative py-24 shadow-lg', selectedVariant.className, className)} {...props}>
      {selectedVariant.overlay}
      <div className={cn('relative mx-auto flex h-full flex-col px-6 md:container', containerClassName)}>
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          transition={{
            duration: 0.5,
            delay,
            ease: 'easeOut',
          }}
          className="flex-1"
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}

// Add some preset configurations for common use cases
// eslint-disable-next-line react/display-name
Section.Hero = (props) => (
  <Section
    variant="gradient"
    className="flex min-h-screen flex-col py-0"
    threshold={0.1}
    containerClassName="h-full flex flex-col"
    {...props}
  />
)

// eslint-disable-next-line react/display-name
Section.Feature = (props) => (
  <Section
    variant="default"
    className="bg-slate-50/50 py-16 dark:bg-slate-900/20"
    containerClassName="max-w-7xl"
    {...props}
  />
)

// eslint-disable-next-line react/display-name
Section.Content = (props) => (
  <Section
    variant="default"
    className="bg-background/50 py-20 backdrop-blur-sm"
    containerClassName="max-w-4xl"
    {...props}
  />
)
