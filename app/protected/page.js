import {
  LoginLink,
  LogoutLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"

import { CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "admin",
}

const page = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center">
        <CardTitle>Hello {user.email}</CardTitle>
        <LogoutLink className="rounded-md bg-teal-600 p-2 px-5">
          <div className="rounded-md bg-teal-600 p-1 px-4">Log out</div>
        </LogoutLink>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center">
        <CardTitle>Not authenticated and not authorized.</CardTitle>
        <LoginLink className="rounded-md bg-teal-900 p-2 px-5">
          Log in
        </LoginLink>
      </div>
    )
  }
}

export default page
