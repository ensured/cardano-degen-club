import Link from "next/link"

import { siteConfig } from "@/config/site"

import FeedBackDrawer from "./Feedback"
import { Icons } from "./icons"
import { buttonVariants } from "./ui/button"

const Footer = () => {
  return (
    <footer className="bg-sky-200/70 shadow dark:bg-zinc-900">
      <div className="flex w-full items-center justify-center gap-10 p-3 md:gap-12 ">
        {/* <div className=" text-sm text-gray-500 hover:underline dark:text-gray-400">
          © 2024 - cardanodegen.shop
        </div> */}
        <FeedBackDrawer />

        <div className="flex overflow-auto">
          <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
            <div
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <Icons.gitHub className="h-5 w-5" />
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
      </div>
    </footer>
  )
}

export default Footer
