"use client"

import Image from "next/image"
import Link from "next/link"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "./ui/button"

const LoginPopup = ({
  children,
  userImg,
}: {
  children: React.ReactNode
  userImg: string
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Image
          className="cursor-pointer rounded-full"
          src={userImg}
          alt="user image"
          width={33}
          height={33}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto border-none p-0 outline-none">
        <Button className="w-full">
          <Link href={"/api/auth/logout"}>Logout</Link>
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export default LoginPopup
