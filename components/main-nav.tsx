import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"

import { Button } from "./ui/button"

export function MainNav() {
  return (
    <Link
      href="/"
      className="rounded-full transition-all duration-100 hover:bg-zinc-500/10"
    >
      <Icons.ada className="size-8 p-0.5 md:size-10" />
    </Link>
  )
}
