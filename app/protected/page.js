
import {
  LoginLink,
  LogoutLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"
import { Title } from "@radix-ui/react-dialog"

import { CardTitle } from "@/components/ui/card"
import Comments from "@/components/Comments"

const page = async () => {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const user = getUser()
  if (isAuthenticated) {
    if (user?.email === "finalemail417@gmail.com") {
      return (
        <>
          <div className="flex flex-col items-center justify-center">

            <Comments>
              <LogoutLink className="rounded-md bg-teal-900 p-2 px-5">
                Log out
              </LogoutLink></Comments>

          </div>

        </>
      )
    } else {
      return (
        <div className="flex flex-col items-center justify-center pt-40">
          {/* Display feedback data here */}
          <CardTitle>No Comments</CardTitle>
          <LogoutLink className="rounded-md bg-teal-900 p-2 px-5">
            Log out
          </LogoutLink>
        </div>
      )
    }
  }
}


export default page
