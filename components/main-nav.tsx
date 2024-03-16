import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import Dropdown from "@/components/Dropdown"
import { Icons } from "@/components/icons"

interface MainNavProps {
  items?: NavItem[]
}

const Icon = ({
  name,
  className,
}: {
  name: keyof typeof Icons
  className?: string
}) => {
  const Component = Icons[name] // Get the corresponding icon component
  return <Component className={className} /> // Render the icon component with the provided className
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex  gap-1 md:gap-10 overflow-x-auto">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.ada className="h-6 w-6 text-black dark:text-white" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          <Dropdown />
        </nav>
      ) : null}
    </div>
  )
}
