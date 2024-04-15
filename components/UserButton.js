import Image from "next/image"
import Link from "next/link"
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"
import { User } from "lucide-react"

import { LoginPopup, LogoutPopup } from "./LoginPopup"
import LoginToolTip from "./LoginToolTip"
import { Button } from "./ui/button"

const UserButton = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser().then((user) => user)

  if (!user) {
    return (
      <div className="group relative z-50 flex shrink-0 flex-col-reverse items-center justify-center">
        <LogoutPopup>
          <Button variant={"ghost"}>Login</Button>
        </LogoutPopup>
      </div>
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
