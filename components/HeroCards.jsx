"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "./ui/button"

const HeroCards = () => {
  return (
    <>
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }} // Adjust animation duration as needed
        className="flex flex-col items-center space-y-4 text-center"
      >
        <motion.div className="space-y-4 transition-transform duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
            Discover Cardano
          </h1>
          <p className="mx-auto max-w-lg text-gray-600 dark:text-gray-400 md:text-lg">
            Unlock the potential of the future internet.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-2 transition-transform duration-500"
        >
          <Link href="/cardano-links">
            <Button
              variant="link"
              className="transition-transform duration-1000 hover:scale-105"
            >
              Explore the new global financial operating system
            </Button>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dive into our curated collection of Cardano resources and start your
            journey today.
          </p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Feature 1 (wrapped in motion.div) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.5 }} // Adjust animation duration as needed
          className="rounded-lg bg-slate-200 p-6 shadow-lg transition-transform duration-500 hover:scale-105 dark:bg-background"
        >
          <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50">
            Decentralization
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Cardano offers the most decentralized global financial operating
            system that reduces middlemen and pushes power to the edges.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.5 }} // Adjust animation duration as needed
          className="rounded-lg bg-slate-200 p-6 shadow-lg transition-transform duration-500 hover:scale-105 dark:bg-background"
        >
          <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-slate-50">
            Security
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            With its layered architecture and rigorous peer-review process,
            Cardano ensures high levels of security for its users.
          </p>
        </motion.div>

        {/* ... Repeat for remaining features, wrapping each in motion.div */}
      </div>
    </>
  )
}

export default HeroCards
