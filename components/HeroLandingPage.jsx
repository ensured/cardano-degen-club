/* eslint-disable tailwindcss/classnames-order */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState } from "react"
import { Chivo } from "next/font/google"
import Link from "next/link"
import { DividerHorizontalIcon } from "@radix-ui/react-icons"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CornerLeftDown,
  Drumstick,
  ExternalLink,
  HardDrive,
  HardDriveIcon,
  Heading1,
  ScalingIcon,
  Users,
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

const chivo = Chivo({
  subsets: ["latin"],
  display: "swap",
})
export default function HeroLandingPage() {
  const [isHovered, setIsHovered] = useState(false)
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

  return (
    <div className="bg-gray-100 dark:bg-slate-800">
      <div className="absolute z-10 opacity-20 right-0 top-0 w-48 px-4 py-2">
        <Particlez />
      </div>
      <motion.section
        initial={{ opacity: 0, y: 0, scale: 0.45 }}
        animate={{ opacity: 1, y: 35, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className=" bg-gray-100 pt-10 opacity-0 dark:bg-gray-800 "
      >
        <div className="md:container mx-auto px-6">
          <div className="flex flex-col items-center space-y-4 text-center select-none">
            <motion.div className="space-y-2">
              <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:pb-8">
                <Link href={"https://cardano.org/"}>
                  <Icons.ada className="h-20 w-20 text-[#0D1E30] dark:text-[#84bfffda] dark:hover:text-[#63a1e4ad] md:h-24 md:w-24 transition-all " />
                </Link>
                <div
                  className={cn(
                    "flex flex-col select-none max-w-lg text-3xl font-bold tracking-tight text-[rgb(255,118,118)] sm:text-4xl md:text-5xl lg:text-5xl ",
                    chivo.className
                  )}
                >
                  <h1>A history of impossible,</h1>
                  <h1>made possible</h1>
                </div>
              </div>

              <div className="p-4 text-lg md:text-2xl flex flex-col justify-center items-center max-w-[520px] mx-auto">
                Unlock the potential of the future internet while also
                safeguarding against inflation.
              </div>
            </motion.div>
            <Link
              href="/cardano-links"
              className="select-none"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div className="max-w-[600px] p-6">
                <div className="relative left-2 mr-6 ">
                  {isHovered && (
                    <span className="animate-fadeIn absolute -right-8 top-2">
                      <ArrowRight />
                    </span>
                  )}{" "}
                  <span className="absolute top-0 left-0 mt-1 ml-1 h-full w-full rounded bg-black dark:bg-white"></span>
                  <span className="fold-bold relative inline-block h-full w-full rounded border-2 border-black dark:border-white bg-[rgb(255,118,118)] dark:bg-[rgb(19,16,16)] dark:hover:bg-zinc-950  px-3 py-1 text-base font-bold text-black dark:text-white transition duration-100 hover:bg-[rgb(245,108,108)] hover:text-gray-900 hover:top-0.5 hover:left-0.5 focus:left-0.5 focus:top-0.5">
                    Explore the new global financial operating system by diving
                    into our curated collection of Cardano resources.
                  </span>
                </div>
              </motion.div>
            </Link>

            <div className="select-none grid grid-cols-1 gap-2 md:grid-cols-2 p-2">
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
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="select-none h-16 bg-gradient-to-b from-gray-100  to-white shadow-xl shadow-secondary dark:from-gray-800 dark:to-background dark:shadow-none"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="select-none h-16 bg-gradient-to-t from-gray-100  to-white shadow-xl shadow-secondary dark:from-gray-800 dark:to-background dark:shadow-none"
        ></motion.div>
      </motion.section>
      <section className="bg-gray-100 py-12 dark:bg-gray-800 select-none">
        <div className="md:container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={keyFeaturesInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            ref={keyFeaturesRef}
            className="h-20 text-center text-2xl font-bold text-zinc-900 dark:text-slate-50 md:text-3xl "
          >
            Key Features
          </motion.div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={feature1InView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              ref={feature1Ref}
              className="rounded-lg border-2 border-sky-300 bg-slate-200 p-6 shadow-lg dark:bg-background"
            >
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50">
                <div className="inline-flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>

                  <div className="text-md md:text-3xl">Decentralization</div>
                </div>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cardano offers the most decentralized global financial operating
                system, empowering individuals by eliminating intermediaries and
                distributing control to the edges. If you are curious about the
                decentralization between different popular blockchains{" "}
                <Link
                  href="http://blockchainlab.inf.ed.ac.uk/edi-dashboard/#/consensus"
                  className=" text-zinc-950 underline dark:text-zinc-100 dark:hover:text-zinc-200 hover:text-zinc-600"
                  target="_blank"
                >
                  click here
                </Link>
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={feature2InView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              ref={feature2Ref}
              className="rounded-lg border-2 border-sky-300 bg-slate-200 p-6 shadow-lg dark:bg-background"
            >
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50">
                {" "}
                <div className="inline-flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="16" r="1" />
                    <rect x="3" y="10" width="18" height="12" rx="2" />
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                  </svg>

                  <div className="text-md md:text-3xl">Security</div>
                </div>
              </h3>
              <p className="text-md text-gray-600 dark:text-gray-400 lg:text-lg">
                With its layered architecture and rigorous peer-review process,
                Cardano ensures high levels of security for its users.
              </p>
            </motion.div>
            {/* Feature 3 */}
            <Dialog>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={feature3InView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.2, delay: 0.2 }}
                ref={feature3Ref}
                className="flex items-center justify-center"
              >
                <DialogTrigger className="cursor-pointer rounded-lg h-full border-2 border-sky-300 bg-slate-200 p-6 shadow-lg hover:bg-slate-300 dark:bg-background hover:dark:bg-slate-500">
                  <h3 className="text-md mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50 md:text-3xl">
                    <div className="flex flex-row items-center gap-2">
                      <ScalingIcon /> Scalability
                    </div>
                  </h3>
                  <p className="text-md text-start text-gray-600 dark:text-gray-400 lg:text-lg">
                    Cardano's innovative technology enables high transaction
                    throughput and scalability, making it suitable for various
                    applications.
                  </p>
                </DialogTrigger>
              </motion.div>
              <DialogContent className="h-full w-full overflow-y-auto">
                <motion.div
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <h3 className="text-md mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50 md:text-3xl">
                    <div className="flex items-center gap-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="44"
                        height="44"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevrons-up"
                      >
                        <path d="m17 11-5-5-5 5" />
                        <path d="m17 18-5-5-5 5" />
                      </svg>
                      Scaling Solutions for Cardano
                    </div>
                  </h3>
                  <p className="text-md pr-24 text-gray-600 dark:text-gray-400 lg:text-lg">
                    Cardano is implementing various strategies to enhance
                    scalability and performance. These include on-chain and
                    off-chain solutions.
                  </p>

                  <h4 className="mb-2 mt-4 flex flex-row gap-1 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                    On-chain Solutions <CornerLeftDown />
                  </h4>
                  <ul className="list-inside list-disc text-gray-600 dark:text-gray-400">
                    <li>
                      Block size increase: Enhancing transaction capacity by
                      increasing block size.
                    </li>
                    <li>
                      Pipelining: Improving block propagation times for faster
                      transactions.
                    </li>
                    <li>
                      Input Endorsers: Enhancing block propagation and
                      throughput.
                    </li>
                    <li>
                      Memory/CPU parameters for Plutus: Optimizing memory usage
                      for efficiency.
                    </li>
                    <li>
                      Plutus script enhancements: Making smart contracts more
                      efficient and cost-effective.
                    </li>
                  </ul>

                  <h4 className="mb-2 mt-4 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                    Node Enhancements
                  </h4>
                  <p className="text-md text-gray-600 dark:text-gray-400 lg:text-lg">
                    Improvements made to the Cardano network nodes to ensure
                    better distribution, memory efficiency, and reduced load at
                    critical points.
                  </p>

                  <h4 className="mb-2 mt-4 inline-flex gap-1 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                    <HardDriveIcon /> On-disk Storage
                  </h4>
                  <p className="text-md text-gray-600 dark:text-gray-400 lg:text-lg">
                    Utilizing on-disk storage for efficient data handling,
                    reducing memory usage and scalability bottlenecks.
                  </p>

                  <h4 className="mb-2 mt-4 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                    Off-chain Solutions
                  </h4>
                  <p className="text-md text-gray-600 dark:text-gray-400 lg:text-lg">
                    Strategies employed outside the Cardano blockchain, such as
                    sidechains, Hydra protocol, off-chain computing, and Mithril
                    for greater scalability and efficiency.
                  </p>
                  <div className="flex flex-col pt-4 md:pt-5">
                    <DialogClose asChild className="p-4">
                      <Button type="button" variant="outline">
                        Close
                      </Button>
                    </DialogClose>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={feature4InView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              ref={feature4Ref}
              className="rounded-lg border-2 border-sky-300 bg-slate-200 p-6 shadow-lg dark:bg-background hover:bg-slate-300  hover:dark:bg-slate-500"
            >
              <Link
                href="https://roadmap.cardano.org/en/voltaire/"
                target="_blank"
              >
                <div className="mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50">
                  <div className="flex items-center gap-2 text-md mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50 md:text-3xl">
                    <Users /> Governance{" "}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  The Voltaire era of Cardano will provide the final pieces
                  required for the Cardano network to become a self-sustaining
                  system. With the introduction of a voting and treasury system,
                  network participants will be able to use their stake and
                  voting rights to influence the future development of the
                  network.
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <motion.div
        initial={{ opacity: 1, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="h-24 bg-gradient-to-b from-gray-100 to-gray-200 shadow-xl shadow-secondary dark:from-gray-800 dark:to-background dark:shadow-none"
      ></motion.div>
    </div>
  )
}
