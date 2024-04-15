import Image from "next/image"
import Link from "next/link"
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"

import { Button } from "@/components/ui/button"

import SearchRecipes from "../../components/SearchRecipes"

export const metadata = {
  title: "Recipe App",
}
const page = async () => {
  const { isAuthenticated, getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !isAuthenticated()) {
    return (
      <div className="flex w-full justify-center text-center">
        <div className=" flex flex-col gap-2 p-2">
          Please login or register to view this page.
          <div className="flex justify-center gap-2 p-2">
            <LoginLink className="rounded-md bg-teal-600 p-2">Login</LoginLink>
            <RegisterLink className="rounded-md bg-teal-600 p-2">
              Register
            </RegisterLink>
          </div>
        </div>
      </div>
    )
  }

  const userInfo = {
    id: user.id,
    name: user.given_name,
    email: user.email,
    picture: user.picture,
  }

  return (
    <>
      <SearchRecipes isAuthenticated={isAuthenticated()} userInfo={userInfo} />
    </>
  )
}

export default page
