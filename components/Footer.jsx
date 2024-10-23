import Link from "next/link"

import { siteConfig } from "@/config/site"

import { cn } from "../lib/utils"
import { Icons } from "./icons"
import { buttonVariants } from "./ui/button"

const Footer = () => {
  return (
    <footer className="bg-white shadow dark:bg-zinc-900">
      <div className="flex flex-wrap">
        <div className="flex w-full justify-center gap-2 overflow-auto p-2 md:p-1.5">
          <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
            <div
              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
                "rounded-full px-3 py-0 md:py-[1.375rem]"
              )}
              // eslint-disable-next-line react/jsx-no-duplicate-props
            >
              <Icons.gitHub className="size-4 md:size-5" />
              <span className="sr-only">GitHub</span>
            </div>
          </Link>
          <Link
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
          >
            <div
              className={cn(
                buttonVariants({
                  variant: "outline",
                }),
                "rounded-full px-3 py-0 md:py-[1.375rem]"
              )}
            >
              <Icons.twitter className="size-4 fill-current md:size-5" />
              <span className="sr-only">Twitter</span>
            </div>
          </Link>
        </div>

        {/* <FeedBackDrawer /> */}
      </div>
    </footer>
  )
}

export default Footer
