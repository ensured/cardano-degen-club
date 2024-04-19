"use client"

import { MoonIcon } from "@radix-ui/react-icons"
import { Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-6 w-6 dark:hidden " />
      <MoonIcon className="hidden h-6 w-6 dark:block" />
    </Button>
  )
}
