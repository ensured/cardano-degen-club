import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"

export function MainNav() {
  return (
    <Link href="/">
      <Icons.ada className="h-8 w-8 md:h-10 md:w-10" />
    </Link>
  )
}
