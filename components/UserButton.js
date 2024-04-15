import Image from "next/image"
import Link from "next/link"
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"
import { User } from "lucide-react"

import LoginToolTip from "./LoginToolTip"
import { Button } from "./ui/button"

const UserButton = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser().then((user) => user)

  if (!user) {
    return (
      <LoginToolTip>
        <Button variant={"ghost"} size={"icon"}>
          <LoginLink>
            <User />
          </LoginLink>
        </Button>
      </LoginToolTip>
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
