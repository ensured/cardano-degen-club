"use client";
import { SignedIn, SignedOut, SignInButton, UserButton as ClerkUserButton } from "@clerk/nextjs"
import { UserIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

const UserButton = () => {

  return (
    <div className="relative flex shrink-0 items-center justify-center">  
      <SignedIn>
        <Button variant="ghost" size="icon">
          <ClerkUserButton userProfileMode="modal" />
        </Button>
      </SignedIn>
      
      <SignedOut>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SignInButton mode="modal">
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
