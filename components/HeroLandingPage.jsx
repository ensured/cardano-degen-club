/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/no-unescaped-entities */
'use client'

import { Chivo } from 'next/font/google'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Code as CodeIcon, ExternalLink, ScalingIcon, Users, ChevronDown } from 'lucide-react'
import { useInView } from 'react-intersection-observer'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { Icons } from './icons'
import { Section } from '@/components/ui/Section'
import { GradientText } from '@/components/ui/GradientText'
import { AnimatedCard } from '@/components/ui/AnimatedCard'

const chivo = Chivo({
  subsets: ['latin'],
  display: 'swap',
})

const GradientHeading = ({ children, className, ...props }) => (
  <h2 className={cn('text-3xl font-bold md:text-4xl', chivo.className, className)}>
    <GradientText>{children}</GradientText>
  </h2>
)

export default function HeroLandingPage() {
  return (
    <div className="relative overflow-hidden">
      <Section.Hero>
        <div className="flex min-h-[calc(100vh-4rem)] flex-col">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div
              className={cn(
                'animate-fade-in flex flex-col gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl',
                chivo.className,
              )}
            >
              <div className="pt-4 text-center sm:pt-0">The Future of Finance is</div>{' '}
              <div className="rounded-md border border-[hsl(276,30%,42%)]/30 bg-gradient-to-r from-[hsl(276,49%,20%)] via-[hsl(276,30%,42%)] to-[hsl(276,49%,20%)] bg-clip-text px-2 py-1 text-center text-transparent shadow-[0_0_15px_rgba(89,46,109,0.3),0_0_25px_rgba(89,46,109,0.2)] transition-shadow hover:shadow-[0_0_20px_rgba(89,46,109,0.4),0_0_30px_rgba(89,46,109,0.3)] dark:border-[hsl(276,70%,60%)]/20 dark:bg-gradient-to-r dark:from-[hsl(276,70%,60%)] dark:via-[hsl(276,80%,70%)] dark:to-[hsl(276,70%,60%)] dark:shadow-[0_0_20px_rgba(186,104,200,0.5),0_0_30px_rgba(186,104,200,0.3)] dark:hover:border-[hsl(276,70%,60%)]/30 dark:hover:shadow-[0_0_25px_rgba(186,104,200,0.6),0_0_40px_rgba(186,104,200,0.4)]">
                Decentralized
              </div>
            </div>
            <p className="mt-6 text-center text-xl text-muted-foreground">
              Join millions of users building a more equitable financial future with Cardano.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-2 sm:flex-row sm:gap-4">
              <Link href="/cardano-links">
                <Button
                  size="lg"
                  className="relative font-semibold transition-transform before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-gradient-to-r before:from-[hsl(276,70%,60%)] before:to-[hsl(276,80%,70%)] before:p-px hover:scale-105"
                >
                  Get Started <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="https://cardano.org/" target="_blank">
                <Button size="lg" variant="outline" className="font-semibold">
                  Learn More <ExternalLink className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="py-8"
            >
              <ChevronDown className="size-8 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </Section.Hero>

      <Section.Feature delay={0.1}>
        <div className="space-y-8">
          <div className="flex w-full flex-col items-center justify-center gap-4 text-center md:flex-row md:text-left">
            <Link href={'https://cardano.org/'}>
              <Icons.ada className="text-[#0D1E30] transition-all hover:scale-110 dark:text-[#84bfffda] dark:hover:text-[#63a1e4ad] md:size-24" />
            </Link>
            <GradientHeading>A history of impossible, made possible</GradientHeading>
          </div>
          <div className="mx-auto flex flex-col items-center justify-center p-4 pb-20 text-xl sm:max-w-[520px]">
            Unlock the potential of the future internet while also safeguarding against inflation.
          </div>
          <div className="flex flex-col items-center justify-center">
            <GradientHeading className="py-6">Understanding Web3</GradientHeading>

            <div className="mx-auto flex flex-col items-center justify-center px-8 py-4 sm:max-w-[796px]">
              <ul className="mb-2 list-disc text-xl">
                <li className="mb-4">
                  <span className="font-bold">Web1</span> started during the 1990s, and it was a period marked by people
                  connecting to the internet and reading what was there, but not publishing or contributing themselves.
                </li>
                <li className="mb-4">
                  <span className="font-bold">Web2</span> came into being during the early 2000s with the rise of social
                  media, faster internet speeds, and mobile devices. Web2 was a period marked by user generated content,
                  targeted advertising, and corporate owned data.
                </li>
                <li className="mb-4">
                  <span className="font-bold">Web3</span> is a new era of the internet that is currently emerging thanks
                  to the power of blockchain technology. Web3 is marked by user-owned data, open-source software,
                  decentralized platforms, property rights, collective action, digital money (cryptocurrencies), and
                  interoperability.
                </li>
              </ul>
              <span className="text-xl">
                Web3 is attempting to solve many of the problems that arose during Web1 and Web2, and it will hopefully
                be yet another step in the direction of a digital world that works better for more people.{' '}
              </span>
            </div>
          </div>
        </div>
      </Section.Feature>

      <Section.Content delay={0.2}>
        <div className="flex flex-col items-center justify-center space-y-12">
          <GradientHeading>Key Features</GradientHeading>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-2">
            <AnimatedCard>
              <div className="text-xl">
                Cardano restores trust to global systems - creating, through science, a more secure, transparent, and
                sustainable foundation for individuals to transact and exchange, systems to govern, and enterprises to
                grow.
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="text-xl">
                {' '}
                Cardano brings a new standard in technology - open and inclusive - to challenge the old and activate a
                new age of sustainable, globally-distributed innovation.
              </div>
            </AnimatedCard>
          </div>

          <AnimatedCard.Content>
            <h2 className={cn('mb-4 text-center text-2xl font-bold md:text-3xl', chivo.className)}>
              Unparalleled Security - And The Makings Of A Trustless World
            </h2>
            <div className="text-xl">
              Cardano makes it possible for any actors that do not know each other - and have no reason to trust one
              another - to interact and transact, securely. It's a platform for building trust where none might
              naturally exist, opening up whole new markets and opportunities. Through Ouroboros, Cardano is provably
              secure against bad actors and Sybil attacks. Every transaction, interaction, and exchange is immutably and
              transparently recovered, and securely validated using multi-signature and a pioneering extended UTXO
              model.
            </div>
          </AnimatedCard.Content>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="https://roadmap.cardano.org/" target="_blank">
              <Button size="lg" variant="outline" className="font-semibold">
                Visit the Roadmap <ExternalLink className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/cardano-links">
              <Button size="lg" className="font-semibold">
                Explore Cardano <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Section.Content>
    </div>
  )
}
