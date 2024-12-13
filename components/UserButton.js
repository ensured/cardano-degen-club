"use client";
import { SignedIn, SignedOut, SignIn, SignInButton, UserButton as ClerkUserButton } from "@clerk/nextjs"
import { UserIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

const UserButton = () => {
  const [open, setOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && 
          !tooltipRef.current.contains(event.target) && 
          !buttonRef.current.contains(event.target)) {
        setOpen(false);
        setClicked(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    setClicked(!clicked);
    setOpen(!open);
  };

  const handleOpenChange = (newOpen) => {
    if (!clicked) {
      setOpen(newOpen);
    }
  };

  return (
    <div className="flex shrink-0 items-center justify-center">  
      <SignedIn>
        <ClerkUserButton userProfileMode="modal" />
      </SignedIn>
      
      <SignedOut>
        <SignInButton>
          <TooltipProvider delayDuration={400}>
            <Tooltip open={open} onOpenChange={handleOpenChange}>
              <TooltipTrigger asChild onClick={handleClick}>
                <Button ref={buttonRef} className="flex items-center gap-2 px-2" variant={"ghost"} size="sm">
                  <UserIcon className="size-6 text-primary-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent ref={tooltipRef} onClick={() => {
                setClicked(false);
                setOpen(false);
              }}>
                <div>
                  <SignIn className="size-6 text-primary-foreground" mode="modal" />
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SignInButton>
      </SignedOut>
    </div>
  )
}

export default UserButton
