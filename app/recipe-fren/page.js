import Image from "next/image"
import Link from "next/link"
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import SearchRecipes from "../../components/SearchRecipes"

export const metadata = {
  title: "Recipe Fren",
}

const page = async () => {
  const { isAuthenticated, getUser } = getKindeServerSession()
  const user = await getUser().then((user) => user)

  if (!user || !isAuthenticated()) {
    return (
      <div className="flex w-full justify-center text-center">
        <div className=" flex flex-col gap-2 p-2 text-xl sm:text-2xl">
          👋 Welcome to Recipe Fren!
          <div className="text-sm dark:text-gray-400/60">
            To unlock all the delicious recipes and the ability to save your
            favorite recipes and even download them as a formatted PDF! Join us
            today!
          </div>
          {/* create shopping lists, and even (add later my other shopping list app) */}
          <div className="flex justify-center gap-3 p-4">
            <LoginLink className={cn(buttonVariants())}>Login</LoginLink>
            <RegisterLink className={cn(buttonVariants())}>
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
