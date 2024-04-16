import Image from "next/image"
import Link from "next/link"
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"

import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

import UserButton from "./UserButton"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full overflow-x-auto border-b bg-background">
      <div className="flex h-16 w-full items-center px-2 md:px-4">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <UserButton />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
