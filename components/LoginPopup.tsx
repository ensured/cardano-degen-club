"use client"

import Image from "next/image"
import Link from "next/link"
import { User } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button, buttonVariants } from "./ui/button"

const LoginPopup = ({
  children,
  userImg,
}: {
  children: React.ReactNode
  userImg: string
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <Image
            className="cursor-pointer rounded-full"
            src={userImg}
            alt="user image"
            width={32}
            height={32}
            priority
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-none p-0 outline-none">
        <Link className={buttonVariants()} href={"/api/auth/logout"}>
          Logout
        </Link>
      </PopoverContent>
    </Popover>
  )
}

const LogoutPopup = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <User />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-none p-0 outline-none">
        <Link className={buttonVariants()} href={"/api/auth/login"}>
          Login
        </Link>
      </PopoverContent>
    </Popover>
  )
}

export { LoginPopup, LogoutPopup }
