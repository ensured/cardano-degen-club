"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton as ClerkUserButton } from "@clerk/nextjs"
import { UserIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
const UserButton = () => {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState(pathname);

  const { theme } = useTheme();


  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);
  
  return (
    <div className="relative flex shrink-0 items-center justify-center">  
      <SignedIn>
        <Button variant="ghost" size="icon">
          <ClerkUserButton afterSignOutUrl={currentPath} appearance={{ baseTheme: theme === "dark" ? dark : "" }} />
        </Button>
      </SignedIn>
      
      <SignedOut>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SignInButton mode="modal" forceRedirectUrl={currentPath}>
                <Button variant="ghost" size="icon">
                  <UserIcon className="size-5" />
                  <span className="sr-only">Sign in</span>
                </Button>
              </SignInButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign in</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SignedOut>
    </div>
  )
}

export default UserButton
