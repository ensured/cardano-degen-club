/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState } from "react"
import { Chivo } from "next/font/google"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CornerLeftDown,
  Code as CodeIcon,
  ExternalLink,
  HardDrive,
  HardDriveIcon,
  Heading1,
  ScalingIcon,
  Users,
  ChevronDown,
} from "lucide-react"
import { useInView } from "react-intersection-observer"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Particlez from "./Particlez"
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
  const [cypherpunkBox, cypherpunkBoxInView] = useInView({
    triggerOnce: true,
    threshold: 0.45, // Adjust as needed
  })
  const [webTableRef, webTableInView] = useInView({
    triggerOnce: true,
    threshold: 0.3, // Adjust as needed
  })

  const [feature1Ref, feature1InView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Adjust as needed
  })

  const [feature2Ref, feature2InView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Adjust as needed
  })
  const [feature3Ref, feature3InView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Adjust as needed
  })
  const [feature4Ref, feature4InView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Adjust as needed
  })

  const [keyFeaturesRef, keyFeaturesInView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Adjust as needed
  })

  const [title1Ref, title1InView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Adjust as needed
  })

  const [title2Ref, title2InView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Adjust as needed
  })
  const [title3Ref, title3InView] = useInView({
    triggerOnce: true,
    threshold: 0.5, // Adjust as needed
  })

  const [finishedContentRef, finishedContentInView] = useInView({
    triggerOnce: true,
    threshold: 0.4, // Adjust as needed
  })

  return (
    <div className="relative">
      <div className="relative h-[100vh] bg-gray-100 dark:bg-slate-800">
        <div className="absolute z-10 opacity-20 right-0 top-0 w-48 px-4 py-2">
          <Particlez />
        </div>
        <div className="relative z-20 mx-auto max-w-5xl px-6 flex flex-col justify-center h-[calc(100vh-80px)] text-center">
          <div className="flex flex-col items-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-4xl font-extrabold tracking-tight sm:text-6xl",
                chivo.className
              )}
            >
              The Future of Finance is 
              <span className="text-[rgb(255,47,179)]"> Decentralized</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground sm:text-xl"
            >
              Join millions of users building a more equitable financial future with Cardano.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex justify-center gap-4"
            >
              <Link href="/cardano-links">
                <Button size="lg" className="font-semibold">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://cardano.org/" target="_blank">
                <Button size="lg" variant="outline" className="font-semibold">
                  Learn More <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            className="absolute left-0 right-0 bottom-12 mx-auto w-fit"
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
            }}
            transition={{ delay: 1 }}
          >
            <motion.div
              animate={{ 
                y: [0, 8, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="flex justify-center items-center"
            >
              <ChevronDown className="h-8 w-8 text-muted-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Section variant="gradient" delay={0.1}>
        <motion.div className="space-y-2">
          <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:pb-8">
            <Link href={"https://cardano.org/"}>
              <Icons.ada className=" text-[#0D1E30] dark:text-[#84bfffda] dark:hover:text-[#63a1e4ad] md:size-24 transition-all" />
            </Link>
            <div
              className={cn(
                "flex flex-col select-none max-w-lg text-4xl font-bold tracking-tight text-[rgb(255,47,179)] sm:text-5xl md:text-5xl  ",
                chivo.className
              )}
            >
              <h1>A history of impossible,</h1>
              <h1>made possible</h1>
            </div>
          </div>
          <div className="pb-20 p-4 text-lg md:text-2xl flex flex-col justify-center items-center max-w-[520px] mx-auto">
            Unlock the potential of the future internet while also
            safeguarding against inflation.
          </div>
          <div className="flex flex-col justify-center items-center ">
            <h1 className="text-4xl font-bold py-6">
              <div className="text-4xl md:text-5xl flex flex-row justify-center">
                Understanding Web3
              </div>{" "}
            </h1>

            <div className="px-8 py-4 flex flex-col justify-center items-center max-w-[796px] mx-auto">
              <ul className="list-disc mb-2">
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
              <span>
                Web3 is attempting to solve many of the problems that arose
                during Web1 and Web2, and it will hopefully be yet another
                step in the direction of a digital world that works better
                for more people.{" "}
              </span>
            </div>
          </div>
        </motion.div>
      </Section>

      <Section variant="grid" delay={0.2}>
        <div className="flex flex-col items-center justify-center">
          <div className="mb-12 text-center text-3xl font-bold text-zinc-900 dark:text-slate-50 md:text-4xl">
            Key Features
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
            <motion.div
              className="max-w-[475px] rounded-lg border border-sky-300 bg-slate-200 p-6 shadow-lg transition-all hover:bg-secondary hover:shadow-2xl dark:bg-background dark:hover:bg-secondary"
              initial={{ opacity: 0 }}
              animate={title1InView ? { opacity: 1 } : {}}
              transition={{ duration: 1, ease: "easeInOut" }}
              ref={title1Ref}
            >
              Cardano restores trust to global systems - creating, through
              science, a more secure, transparent, and sustainable foundation
              for individuals to transact and exchange, systems to govern, and
              enterprises to grow.{" "}
            </motion.div>
            <motion.div
              className="select-none container max-w-[475px] rounded-lg border border-sky-300 bg-slate-200 p-6 shadow-lg transition-all hover:bg-secondary hover:shadow-2xl dark:bg-background dark:hover:bg-secondary"
              initial={{ opacity: 0 }}
              animate={title2InView ? { opacity: 1 } : {}}
              transition={{ duration: 1, ease: "easeInOut" }}
              ref={title2Ref}
            >
              Cardano brings a new standard in technology - open and inclusive
              - to challenge the old and activate a new age of sustainable,
              globally-distributed innovation.
            </motion.div>
          </div>
          <div className="grid grid-cols-1 gap-2 p-2">
            <motion.div
              className="select-none flex flex-col max-w-[960px] gap-4 rounded-lg border border-sky-300 bg-slate-200 p-6 shadow-lg transition-all hover:bg-secondary hover:shadow-2xl dark:bg-background dark:hover:bg-secondary"
              initial={{ opacity: 0 }}
              animate={title3InView ? { opacity: 1 } : {}}
              transition={{ duration: 1, ease: "easeInOut" }}
              ref={title3Ref}
            >
              <div className="text-2xl md:text-3xl">
                <u>Unparalleled Security</u> - And The Makings Of A Trustless
                World
              </div>
              Cardano makes it possible for any actors that do not know each
              other - and have no reason to trust one another - to interact
              and transact, securely. It's a platform for building trust where
              none might naturally exist, opening up whole new markets and
              opportunities. Through Ouroboros, Cardano is provably secure
              against bad actors and Sybil attacks. Every transaction,
              interaction, and exchange is immutably and transparently
              recovered, and securely validated using multi-signature and a
              pioneering extended UTXO model.{" "}
              <Link href="https://roadmap.cardano.org/">
                <Button>Visit the roadmap</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </Section>

      <Section variant="gradient" delay={0.3}>
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-3xl md:text-4xl font-bold text-center text-zinc-900 dark:text-slate-50">
            You are now ready to start exploring the ecosystem 👏
          </div>
          
          <Link href="/cardano-links" className="w-full max-w-2xl">
            <div className="flex justify-center items-center p-8">
              <div className="relative text-md">
                <span className="absolute top-0 left-0 mt-1 ml-1 size-full rounded bg-black dark:bg-white"></span>
                <span className="max-w-[420px] fold-bold relative inline-block size-full rounded border-2 border-black dark:border-white bg-[rgb(255,47,179)] hover:bg-[rgb(225,77,179)] dark:bg-[rgb(19,16,16)] dark:hover:bg-zinc-950 px-3 py-1 text-md md:text-2xl font-bold text-black dark:text-white transition duration-100 hover:text-gray-900 hover:top-0.5 hover:left-0.5 focus:left-0.5 focus:top-0.5">
                  Download a Cardano wallet to get started and explore our
                  official Cardano links (we recommend Vespr wallet)
                </span>
              </div>
            </div>
          </Link>

          <div className="text-sm text-gray-100/40 text-center">
            Remember to always do your own research
          </div>
        </div>
      </Section>
    </div>
  )
}
