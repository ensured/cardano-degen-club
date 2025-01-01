"use client"
import { ClerkProvider } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"


export default function CustomClerkProvider({ children }) {
  const pathname = usePathname()
  const [currentPath, setCurrentPath] = useState(pathname)

  useEffect(() => {
    setCurrentPath(pathname)
  }, [pathname])

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl={currentPath}
    >
      {children}
    </ClerkProvider>
  )
}
