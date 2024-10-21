import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

import { LoginPopup, LogoutPopup } from "./LoginPopup"

const UserButton = async () => {
  const { getUser } = getKindeServerSession()
  const user = getUser()
  if (!user) {
    return (
      <div className="group relative z-50 flex shrink-0 flex-col-reverse items-center justify-center">
        <LogoutPopup />
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
