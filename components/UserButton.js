import Image from "next/image"
import Link from "next/link"
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"
import { User } from "lucide-react"

import { Button } from "./ui/button"

const UserButton = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser().then((user) => user)

  if (!user) {
    return (
      <LoginLink>
        <Button variant={"outline"} className="flex flex-row gap-1">
          <User className="h-4 w-4" />
          Login{" "}
        </Button>
      </LoginLink>
    )
  }

  return (
    <div className="group relative z-50 flex shrink-0 flex-col-reverse items-center justify-center">
      <Link
        href={"/api/auth/logout"}
        className="fixed top-14 flex opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer "
      >
        <Button>Logout</Button>
      </Link>
      <Image
        className="rounded-full"
        src={user.picture}
        alt="user image"
        width={33}
        height={33}
      />
    </div>
  )
}

export default UserButton
