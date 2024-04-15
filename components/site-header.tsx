import Image from "next/image"
import Link from "next/link"
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"

import { siteConfig } from "@/config/site"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export async function SiteHeader() {
  const { isAuthenticated, getUser } = getKindeServerSession()
  const user = await getUser().then((user) => user)

  if (!user || !isAuthenticated()) {
    return (
      <header className="sticky top-0 z-40 w-full overflow-x-auto border-b bg-background">
        <div className="flex h-16 w-full items-center px-2 md:px-4">
          <MainNav />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
              >
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

              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
    )
  }

  const userInfo = {
    id: user.id,
    name: user.given_name,
    email: user.email,
    picture: user.picture,
  }

  return (
    <header className="sticky top-0 z-40 w-full overflow-x-auto border-b bg-background">
      <div className="flex h-16 w-full items-center px-2 md:px-4">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
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
            {/* display user image in a button (circle) */}
            {isAuthenticated && (
              <div className="group relative z-50 flex flex-col-reverse items-center justify-center shrink-0">
                <Link
                  href={"/api/auth/logout"}
                  className="fixed top-14 flex opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer "
                >
                  <Button>Logout</Button>
                </Link>
                <Image
                  className="rounded-full"
                  src={userInfo.picture}
                  alt="user image"
                  width={33}
                  height={33}
                />
              </div>
            )}
            <ThemeToggle />
            {/* display user image in a button (circle) */}
          </nav>
        </div>
      </div>
    </header>
  )
}
