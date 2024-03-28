/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CornerLeftDown,
  Drumstick,
  ExternalLink,
  HardDrive,
  HardDriveIcon,
  ScalingIcon,
} from "lucide-react"

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

export default function HeroLandingPage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="dark:bg-slate-800">
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" bg-gray-100 pt-16 opacity-0 dark:bg-gray-800 "
      >
        <div className="container mx-auto px-4 pb-16 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="mx-auto max-w-lg text-3xl font-bold tracking-tight  text-zinc-900 dark:text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
                Discover Cardano
              </h1>
              <p className=" text-md text-gray-600 dark:text-gray-400 md:text-lg lg:text-lg">
                Unlock the potential of the future internet while also
                safeguarding against inflation.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="rounded-lg border-2 border-sky-300 bg-slate-200 p-6 shadow-lg hover:scale-105  dark:bg-background"
            >
              <Link
                href="/cardano-links"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Button
                  variant="link"
                  className="relative h-auto text-xl text-sky-500 transition-all duration-700 hover:translate-x-1 dark:text-slate-50 md:text-2xl"
                >
                  {isHovered && (
                    <span className="absolute -right-4">
                      <ExternalLink />
                    </span>
                  )}
                  Explore the new global financial operating system
                </Button>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dive into our curated collection of Cardano resources and start
                your journey today.
              </p>
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-16 bg-gradient-to-b from-gray-100  to-white shadow-xl shadow-secondary dark:from-gray-800 dark:to-background dark:shadow-none"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-16 bg-gradient-to-t from-gray-100  to-white shadow-xl shadow-secondary dark:from-gray-800 dark:to-background dark:shadow-none"
        ></motion.div>
      </motion.section>

      <section className="bg-gray-100 py-12 dark:bg-gray-800">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="h-20 text-center text-2xl font-bold text-zinc-900 dark:text-slate-50 md:text-3xl "
          >
            Key Features
          </motion.div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-lg border-2 border-sky-300 bg-slate-200 p-6 shadow-lg hover:scale-105 dark:bg-background"
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
                  className=" text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-500"
                  target="_blank"
                >
                  click here
                </Link>
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
              <DialogTrigger>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="cursor-pointer rounded-lg border-2 border-sky-300 bg-slate-200 p-6 shadow-lg hover:scale-105 hover:bg-slate-300 dark:bg-background hover:dark:bg-slate-500"
                >
                  <h3 className="text-md mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50 md:text-3xl">
                    <div className="flex flex-row items-center gap-2">
                      <ScalingIcon /> Scalability
                    </div>
                  </h3>
                  <p className="text-md text-gray-600 dark:text-gray-400 lg:text-lg">
                    Cardano's innovative technology enables high transaction
                    throughput and scalability, making it suitable for various
                    applications.
                  </p>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="h-full w-full overflow-y-auto">
                <motion.div
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
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
          </div>
        </div>
      </section>
      <motion.div
        initial={{ opacity: 1, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="h-24 bg-gradient-to-b from-gray-100 to-gray-200 shadow-xl shadow-secondary dark:from-gray-800 dark:to-background dark:shadow-none"
      ></motion.div>
    </div>
  )
}
