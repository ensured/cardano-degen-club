"use client";
import { SignedIn, SignedOut, SignIn, SignInButton, UserButton as ClerkUserButton } from "@clerk/nextjs"
import { UserIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { CustomGoogleOneTap } from "./CustomGoogleOneTap"; 
import { useWindowSize } from "@uidotdev/usehooks";

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

  const {width} = useWindowSize();

  return (
    <div className="flex shrink-0 items-center justify-center relative">  
      <SignedIn>
        <Button variant={"ghost"} size="icon">
          <ClerkUserButton userProfileMode="modal" />
        </Button>
      </SignedIn>
      
      <SignedOut>
        <SignInButton className="">
          <TooltipProvider delayDuration={400}>
            <Tooltip open={open} onOpenChange={handleOpenChange}>
              <TooltipTrigger asChild onClick={handleClick}>
                <Button ref={buttonRef} className="flex items-center" variant={"ghost"} size="sm">
                  <UserIcon className="size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className={`absolute top-10 ${width < 368 ? "-left-64" : width < 400 ? "-left-72" : "-left-96"}`} ref={tooltipRef} onClick={() => {
                setClicked(false);
                setOpen(false);
              }}>
                <div className="">
                  <SignIn className="size-6" mode="modal" />
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
