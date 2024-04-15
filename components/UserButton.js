import Image from "next/image"
import Link from "next/link"
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"
import { User } from "lucide-react"

import LoginPopup from "./LoginPopup"
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
      <LoginPopup userImg={user.picture}>
        <Button variant={"ghost"}>Login</Button>
      </LoginPopup>
    </div>
  )
}

export default UserButton
