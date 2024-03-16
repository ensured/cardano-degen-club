/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink, LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HeroLandingPage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className=" bg-gray-100 dark:bg-gray-800">
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" bg-gray-100 pt-16 opacity-0 dark:bg-gray-800 "
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="mx-auto max-w-lg text-3xl font-bold tracking-tight  text-zinc-900 dark:text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
                Discover Cardano
              </h1>
              <p className=" text-gray-600 dark:text-gray-400 md:text-lg text-md lg:text-lg">
                Unlock the potential of the future internet.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="rounded-lg bg-slate-200 p-6 shadow-lg  hover:scale-105 dark:bg-background"
            >
              <Link
                href="/cardano-links"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Button
                  variant="link"
                  className="relative text-moon transition-all duration-700 hover:translate-x-1 dark:text-slate-50"
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
          className="h-20 bg-gradient-to-b from-gray-100 to-white shadow-xl shadow-secondary dark:from-gray-800 dark:to-background dark:shadow-none"
        ></motion.div>
      </motion.section>

      <section className="bg-gray-100 py-12 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 0.8 }}
            className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-slate-50 md:text-3xl"
          >
            Key Features
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="rounded-lg bg-slate-200 p-6 shadow-lg hover:scale-105 dark:bg-background"
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
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-globe"
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
                decentralization between different popular blockchains click{" "}
                <Link
                  href="http://blockchainlab.inf.ed.ac.uk/edi-dashboard/#/consensus"
                  className="text-slate-200"
                  target="_blank"
                >
                  Here
                </Link>
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="rounded-lg bg-slate-200 p-6 shadow-lg hover:scale-105 dark:bg-background"
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
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-lock-keyhole"
                  >
                    <circle cx="12" cy="16" r="1" />
                    <rect x="3" y="10" width="18" height="12" rx="2" />
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                  </svg>
                  <div>Security</div>
                </div>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-md lg:text-lg">
                With its layered architecture and rigorous peer-review process,
                Cardano ensures high levels of security for its users.
              </p>
            </motion.div>
            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="rounded-lg bg-slate-200 p-6 shadow-lg   hover:scale-105 dark:bg-background"
            >
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50">
                Scalability
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-md lg:text-lg">
                Cardano's innovative technology enables high transaction
                throughput and scalability, making it suitable for various
                applications.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="rounded-lg bg-slate-200 p-6 shadow-lg   hover:scale-105 dark:bg-background"
            >
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50">
                Scaling Solutions for Cardano
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-md lg:text-lg">
                Cardano is implementing various strategies to enhance
                scalability and performance. These include on-chain and
                off-chain solutions.
              </p>

              <h4 className="mb-2 mt-4 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                On-chain Solutions
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
                  Input Endorsers: Enhancing block propagation and throughput.
                </li>
                <li>
                  Memory/CPU parameters for Plutus: Optimizing memory usage for
                  efficiency.
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
                Improvements made to the Cardano network nodes to ensure better
                distribution, memory efficiency, and reduced load at critical
                points.
              </p>

              <h4 className="mb-2 mt-4 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                On-disk Storage
              </h4>
              <p className="text-md text-gray-600 dark:text-gray-400 lg:text-lg">
                Utilizing on-disk storage for efficient data handling, reducing
                memory usage and scalability bottlenecks.
              </p>

              <h4 className="mb-2 mt-4 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                Off-chain Solutions
              </h4>
              <p className="text-md text-gray-600 dark:text-gray-400 lg:text-lg">
                Strategies employed outside the Cardano blockchain, such as
                sidechains, Hydra protocol, off-chain computing, and Mithril for
                greater scalability and efficiency.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
