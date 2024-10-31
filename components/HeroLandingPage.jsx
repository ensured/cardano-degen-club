/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { Chivo } from "next/font/google"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Code as CodeIcon,
  ExternalLink,
  ScalingIcon,
  Users,
  ChevronDown,
} from "lucide-react"
import { useInView } from "react-intersection-observer"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


import { Icons } from "./icons"
import { Section } from "@/components/ui/Section"

const chivo = Chivo({
  subsets: ["latin"],
  display: "swap",
})

const features = [
  {
    title: "Proof of Stake",
    description: "Energy-efficient consensus mechanism that allows anyone to participate in network security.",
    icon: ScalingIcon,
  },
  {
    title: "Smart Contracts",
    description: "Build decentralized applications with Plutus, a purpose-built smart contract platform.",
    icon: CodeIcon,
  },
  {
    title: "Governance",
    description: "Community-driven development through on-chain voting and treasury system.",
    icon: Users,
  },
  // Add more features as needed
]

const stats = [
  { value: '2M+', label: 'Active Users' },
  { value: '$40B+', label: 'Total Value Locked' },
  { value: '3,000+', label: 'Projects Built' },
  { value: '0.07¢', label: 'Average TX Fee' },
]

export default function HeroLandingPage() {
  const [title1Ref, title1InView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [title2Ref, title2InView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [title3Ref, title3InView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div className="relative overflow-visible">
      <Section.Hero>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className={cn(
              "text-4xl font-extrabold tracking-tight sm:text-6xl flex flex-col gap-2 animate-fade-in",
              chivo.className
            )}>
              <span>The Future of Finance is</span>{" "}
              <span className="bg-gradient-to-r from-[hsl(276,49%,20%)] via-[hsl(276,30%,42%)] to-[hsl(276,49%,20%)] bg-clip-text text-transparent px-2 py-1 
                border border-[hsl(276,30%,42%)]/30 rounded-md 
                shadow-[0_0_15px_rgba(89,46,109,0.3),0_0_25px_rgba(89,46,109,0.2)] 
                hover:shadow-[0_0_20px_rgba(89,46,109,0.4),0_0_30px_rgba(89,46,109,0.3)] transition-shadow
                dark:bg-gradient-to-r dark:from-[hsl(276,70%,60%)] dark:via-[hsl(276,80%,70%)] dark:to-[hsl(276,70%,60%)] 
                dark:border-[hsl(276,70%,60%)]/20 
                dark:shadow-[0_0_20px_rgba(186,104,200,0.5),0_0_30px_rgba(186,104,200,0.3)]
                dark:hover:shadow-[0_0_25px_rgba(186,104,200,0.6),0_0_40px_rgba(186,104,200,0.4)] dark:hover:border-[hsl(276,70%,60%)]/30">
                Decentralized
              </span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Join millions of users building a more equitable financial future with Cardano.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/cardano-links">
                <Button size="lg" className="font-semibold relative 
                  before:absolute before:inset-0 before:-z-10 before:rounded-lg 
                  before:bg-gradient-to-r before:from-[hsl(276,70%,60%)] before:to-[hsl(276,80%,70%)] 
                  before:p-[1px] hover:scale-105 transition-transform">
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
                ease: "easeInOut"
              }}
              className="py-8"
            >
              <ChevronDown className="h-8 w-8 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </Section.Hero>

      <Section.Feature delay={0.1}>
        <div className="space-y-8">
          <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row text-center md:text-left">
            <Link href={"https://cardano.org/"}>
              <Icons.ada className="text-[#0D1E30] dark:text-[#84bfffda] dark:hover:text-[#63a1e4ad] md:size-24 transition-all hover:scale-110" />
            </Link>
            <div
              className={cn(
                "flex flex-col select-none text-4xl font-bold tracking-tight sm:text-5xl md:text-5xl",
                chivo.className
              )}
            >
              <h1 className="bg-gradient-to-r from-[hsl(276,49%,20%)] via-[hsl(276,30%,42%)] to-[hsl(276,49%,20%)] bg-clip-text text-transparent
                dark:from-[hsl(276,70%,60%)] dark:via-[hsl(276,80%,70%)] dark:to-[hsl(276,70%,60%)]
                hover:opacity-80 transition-opacity">
                A history of impossible, made possible
              </h1>
            </div>
          </div>
          <div className="pb-20 p-4 text-xl text-muted-foreground flex flex-col justify-center items-center max-w-[520px] mx-auto">
            Unlock the potential of the future internet while also
            safeguarding against inflation.
          </div>
          <div className="flex flex-col justify-center items-center ">
            <h1 className={cn(
              "text-4xl md:text-5xl font-bold py-6",
              chivo.className
            )}>
              <div className="bg-gradient-to-r from-[hsl(276,49%,20%)] via-[hsl(276,30%,42%)] to-[hsl(276,49%,20%)] bg-clip-text text-transparent
                dark:from-[hsl(276,70%,60%)] dark:via-[hsl(276,80%,70%)] dark:to-[hsl(276,70%,60%)]
                hover:opacity-80 transition-opacity">
                Understanding Web3
              </div>
            </h1>

            <div className="px-8 py-4 flex flex-col justify-center items-center max-w-[796px] mx-auto">
              <ul className="list-disc mb-2 text-xl text-muted-foreground">
                <li className="mb-4">
                  <span className="font-bold">Web1</span> started during the
                  1990s, and it was a period marked by people connecting to
                  the internet and reading what was there, but not
                  publishing or contributing themselves.
                </li>
                <li className="mb-4">
                  <span className="font-bold">Web2</span> came into being
                  during the early 2000s with the rise of social media,
                  faster internet speeds, and mobile devices. Web2 was a
                  period marked by user generated content, targeted
                  advertising, and corporate owned data.
                </li>
                <li className="mb-4">
                  <span className="font-bold">Web3</span> is a new era of
                  the internet that is currently emerging thanks to the
                  power of blockchain technology. Web3 is marked by
                  user-owned data, open-source software, decentralized
                  platforms, property rights, collective action, digital
                  money (cryptocurrencies), and interoperability.
                </li>
              </ul>
              <span className="text-xl text-muted-foreground">
                Web3 is attempting to solve many of the problems that arose
                during Web1 and Web2, and it will hopefully be yet another
                step in the direction of a digital world that works better
                for more people.{" "}
              </span>
            </div>
          </div>
        </div>
      </Section.Feature>

      <Section.Content delay={0.2}>
        <div className="flex flex-col items-center justify-center space-y-12">
          <h2 className={cn(
            "text-3xl md:text-4xl font-bold",
            chivo.className
          )}>
            <span className="bg-gradient-to-r from-[hsl(276,49%,20%)] to-[hsl(276,30%,42%)] bg-clip-text text-transparent
              dark:from-[hsl(276,70%,60%)] dark:to-[hsl(276,80%,70%)]
              hover:opacity-80 transition-opacity">
              Key Features
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-2">
            <motion.div
              className="p-6 rounded-lg bg-card/95 backdrop-blur-sm text-card-foreground shadow-lg 
                hover:bg-secondary/50 hover:scale-[1.02] transition-all text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={title1InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              ref={title1Ref}
            >
              Cardano restores trust to global systems - creating, through science, a more secure, transparent, and sustainable foundation for individuals to transact and exchange, systems to govern, and enterprises to grow.
            </motion.div>
            
            <motion.div
              className="p-6 rounded-lg bg-card/95 backdrop-blur-sm text-card-foreground shadow-lg 
                hover:bg-secondary/50 hover:scale-[1.02] transition-all text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={title2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              ref={title2Ref}
            >
              Cardano brings a new standard in technology - open and inclusive - to challenge the old and activate a new age of sustainable, globally-distributed innovation.
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <motion.div
              className="p-6 rounded-lg bg-card text-card-foreground shadow-lg hover:bg-secondary/50 transition-all md:col-span-2"
              initial={{ opacity: 0 }}
              animate={title3InView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              ref={title3Ref}
            >
              <div className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-[hsl(276,49%,20%)] via-[hsl(276,30%,42%)] to-[hsl(276,49%,20%)] bg-clip-text text-transparent
                dark:from-[hsl(276,70%,60%)] dark:via-[hsl(276,80%,70%)] dark:to-[hsl(276,70%,60%)]
                hover:opacity-80 transition-opacity">
                Unparalleled Security - And The Makings Of A Trustless World
              </div>
              <div className="text-xl text-muted-foreground">
                Cardano makes it possible for any actors that do not know each
                other - and have no reason to trust one another - to interact
                and transact, securely. It's a platform for building trust where
                none might naturally exist, opening up whole new markets and
                opportunities. Through Ouroboros, Cardano is provably secure
                against bad actors and Sybil attacks. Every transaction,
                interaction, and exchange is immutably and transparently
                recovered, and securely validated using multi-signature and a
                pioneering extended UTXO model.
              </div>
            </motion.div>
          </div>

          <div className="flex gap-4 justify-center">
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
