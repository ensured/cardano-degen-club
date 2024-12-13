import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Suspense } from "react"

import { HeaderNavSheet } from "./HeaderNavSheet"
import UserButton from "./UserButton"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full overflow-x-auto border-b bg-background">
      <div className="m-1 flex h-16 w-full items-center gap-3 px-4 md:px-3">
        <MainNav />
        <HeaderNavSheet />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center gap-1">
              <UserButton />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
