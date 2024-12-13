import { SignedIn, SignedOut, SignInButton, SignOutButton, GoogleOneTap } from "@clerk/nextjs"
import Image from "next/image"
import { currentUser } from "@clerk/nextjs/server"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { User } from "lucide-react"


const UserButton = async () => {
  const user = await currentUser()

  return (
    <div className="flex shrink-0 items-center justify-center">  
      <SignedIn>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none hover:ring-2 hover:ring-gray-200">
            <Image 
              src={user?.imageUrl} 
              alt="User Image" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <SignOutButton redirectUrl={"/recipe-fren"}>
              <DropdownMenuItem className="cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedIn>
      
      <SignedOut>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <SignInButton>
              <DropdownMenuItem className="cursor-pointer">
                Sign in
              </DropdownMenuItem>
            </SignInButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedOut>
    </div>
  )
}

export default UserButton
