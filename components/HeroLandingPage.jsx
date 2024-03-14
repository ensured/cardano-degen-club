/**
 * v0 by Vercel.
 * @see https://v0.dev/t/2cfexGqNX1L
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function HeroLandingPage() {
  return (
    <section className="w-full bg-gray-100 pb-12 pt-14 dark:bg-gray-800 md:pb-24 lg:pb-32 xl:pb-48">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-">
            <h1 className="text-3xl font-bold tracking-tight  text-zinc-900 dark:text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
              Discover Cardano
            </h1>
            <p className="mx-auto max-w-lg text-gray-600 dark:text-gray-400 md:text-lg">
              Unlock the potential of the future internet.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <Link href="/cardano-links">
              <Button variant="primary">
                Explore the global financial operating system
              </Button>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dive into our curated collection of Cardano resources and start
              your journey today.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
