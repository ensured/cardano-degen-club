import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { cn } from "@/lib/utils"

import { LoginPopup, LogoutPopup } from "./LoginPopup"
import { Button, buttonVariants } from "./ui/button"

const UserButton = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser().then((user) => user)

  if (!user) {
    return (
      <div className="group relative z-50 flex shrink-0 flex-col-reverse items-center justify-center">

                  <Button variant={"ghost"}>Login</Bu

      </div>
    )
  }

  return (
    <div className="group relative z-50 flex shrink-0 flex-col-reverse items-center justify-center">
      <LoginPopup userImg={user.picture} />
    </div>
  )
}

export default UserButton
