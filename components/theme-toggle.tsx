"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-[#000000]/70 hover:text-[#000000] dark:text-[#ffffff]/70 dark:hover:text-[#ffffff]"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Moon className="hidden size-7 dark:block" />
      <Sun className="block size-7 dark:hidden" />
    </Button>
  )
}
