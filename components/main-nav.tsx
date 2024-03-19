import Link from "next/link"

import { siteConfig } from "@/config/site"
import Dropdown from "@/components/Dropdown"
import { Icons } from "@/components/icons"

export function MainNav() {
  return (
    <div className="flex gap-2 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.ada className="h-6 w-6" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      <nav className="flex gap-6">
        <Dropdown />
      </nav>
    </div>
  )
}
