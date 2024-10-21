import Image from "next/image"
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
  const user = await getUser()

  if (!user || !isAuthenticated()) {
    return (
      <div className="flex w-full justify-center pt-6 text-center">
        <div className=" flex flex-col items-center justify-center gap-2 p-2 text-xl sm:text-2xl">
          👋 Welcome to Recipe Fren!
          <div className="max-w-[22rem] p-8 text-sm dark:text-gray-400/60 md:max-w-[26rem]">
            Sign in to unlock all the delicious recipes and the ability to save
            your favorite recipes and even download them as a formatted PDF
            file!
          </div>
          {/* TODOS: 
          create recipe lists seperate from one another
          and also (add my already made shopping list app) */}
          <div>
            <LoginLink
              className={cn(buttonVariants(), "w-[260px] items-center")}
            >
              Sign In
              <span className="ml-2 inline-flex">
                <Image
                  src="/google_logo.png"
                  width={20}
                  height={20}
                  alt="Google"
                  className="mr-2"
                />
                <svg
                  className="kui-icon kui-icon--size-medium kui-icon--type-custom"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#000"
                    d="M18.305 13.856 28.505 2h-2.417l-8.856 10.294L10.158 2H2l10.696 15.567L2 30h2.417l9.353-10.871L21.24 30h8.158L18.305 13.856Zm-3.31 3.848-1.084-1.55L5.288 3.82h3.713l6.959 9.954 1.083 1.55 9.046 12.94h-3.712l-7.382-10.56Z"
                  ></path>
                </svg>
              </span>
            </LoginLink>

            {/* <RegisterLink className={cn(buttonVariants())}>
              Register
            </RegisterLink> */}
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
