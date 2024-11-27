import dynamic from "next/dynamic"
import Image from "next/image"
import {
  LoginLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"
import { Toaster } from "react-hot-toast"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import Animation from "@/components/Animation"
import SearchRecipes from "@/components/SearchRecipes"

export const metadata = {
  title: "Recipe Fren | Recipe Search and Collection",
  description: "Discover and save your favorite recipes with our AI-powered recipe search. Create personalized collections and get cooking inspiration.",
  keywords: "recipes, cooking, meal planning, recipe search, food, AI recipes, recipe collection",
  openGraph: {
    title: "Recipe Fren | Recipe Search",
    description: "Discover and save your favorite recipes with our AI-powered recipe search.",
    type: "website",
  },
}

const TOAST_OPTIONS = {
  className: "dark:bg-zinc-950 dark:text-slate-100",
  position: "bottom-center",
  success: {
    style: {
      background: "green",
    },
  },
  error: {
    style: {
      background: "red",
    },
  },
}

const RecipeFrenPage = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  const email = await user?.email

  if (!email) {
    return (
      <Animation>
        <div className="flex w-full justify-center pt-6 text-center">
          <div className=" flex flex-col items-center justify-center gap-2 p-2 text-xl sm:text-2xl">
            👋 Welcome to Recipe Fren!
            <div className="max-w-[22rem] p-8 text-sm dark:text-gray-400/60 md:max-w-[26rem]">
              Sign in to unlock all the delicious recipes and the ability to
              save your favorite recipes and even download them as a formatted
              PDF file!
            </div>
            <div className="flex flex-col gap-3">
              <LoginLink
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-[260px] items-center bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  Sign in with Google
                  <Image
                    src="/google_logo.png"
                    width={20}
                    height={20}
                    alt="Google"
                    className="mr-1"
                  />
                </span>
              </LoginLink>

              <LoginLink
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-[260px] items-center bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  Sign in with GitHub
                  <svg
                    className="size-5 dark:fill-white"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </span>
              </LoginLink>

              <LoginLink
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-[260px] items-center bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  Sign in with
                  <svg
                    className="h-5 w-5 dark:fill-white"
                    fill="currentColor"
                    viewBox="0 -4 38 38"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.305 13.856 28.505 2h-2.417l-8.856 10.294L10.158 2H2l10.696 15.567L2 30h2.417l9.353-10.871L21.24 30h8.158L18.305 13.856Zm-3.31 3.848-1.084-1.55L5.288 3.82h3.713l6.959 9.954 1.083 1.55 9.046 12.94h-3.712l-7.382-10.56Z" />
                  </svg>
                </span>
              </LoginLink>
            </div>
          </div>
        </div>
      </Animation>
    )
  }

  return (
    <Animation>
      <main className="min-h-screen">
        <h1 className="sr-only">Recipe Fren - Your Recipe Fren</h1>
        <SearchRecipes userEmail={email} />
        <Toaster toastOptions={TOAST_OPTIONS} />
      </main>
    </Animation>
  )
}

export default RecipeFrenPage
