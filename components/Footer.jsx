import Link from "next/link"

import { siteConfig } from "@/config/site"

import { Icons } from "./icons"
import { buttonVariants } from "./ui/button"

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/85 shadow dark:bg-zinc-900/85">
      <div className=" mx-auto flex w-full flex-wrap items-center justify-evenly gap-2 p-1 md:container">
        <div className="flex overflow-auto">
          <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
            <div
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.gitHub className="size-5" />
              <span className="sr-only">GitHub</span>
            </div>
          </Link>
          <Link
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
          >
            <div
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.twitter className="h-5 w-5 fill-current" />
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
