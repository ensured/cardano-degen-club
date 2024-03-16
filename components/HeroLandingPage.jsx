/* eslint-disable react/no-unescaped-entities */
"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"

export default function HeroLandingPage() {
  return (
    <div className="bg-gray-100 dark:bg-gray-800">
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-gray-100 pt-8 opacity-0 dark:bg-gray-800 "
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className=" text-3xl font-bold tracking-tight  text-zinc-900 dark:text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
                Discover Cardano
              </h1>
              <p className="mx-auto max-w-lg text-gray-600 dark:text-gray-400 md:text-lg">
                Unlock the potential of the future internet.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="rounded-lg bg-slate-200 p-6 shadow-lg  hover:scale-105 dark:bg-background"
            >
              <Link href="/cardano-links">
                <Button
                  variant="link"
                  className=" text-moon hover:scale-105   dark:text-slate-50  "
                >
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
            className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-slate-50 md:text-2xl"
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
                Decentralization
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
                Security
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
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
              <p className="text-gray-600 dark:text-gray-400">
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
              <p className="text-gray-600 dark:text-gray-400">
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
              <p className="text-gray-600 dark:text-gray-400">
                Improvements made to the Cardano network nodes to ensure better
                distribution, memory efficiency, and reduced load at critical
                points.
              </p>

              <h4 className="mb-2 mt-4 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                On-disk Storage
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Utilizing on-disk storage for efficient data handling, reducing
                memory usage and scalability bottlenecks.
              </p>

              <h4 className="mb-2 mt-4 text-lg font-semibold text-zinc-900 dark:text-slate-50">
                Off-chain Solutions
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
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
