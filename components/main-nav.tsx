import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"

export function MainNav() {
  return (
    <div className="flex gap-1">
      <Link href="/" className="ml-1 flex items-center space-x-2">
        <Icons.ada className=" h-6 w-6" />
        <span className="font-bold">{siteConfig.name}</span>
      </Link>
    </div>
  )
}
