
import Image from "next/image"
import { currentUser } from "@clerk/nextjs/server"
import { Toaster } from "react-hot-toast"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import Animation from "@/components/Animation"
import SearchRecipes from "@/components/SearchRecipes"

export const metadata = {
  title: "Recipe Fren | Recipe Search and Collection",
  description: "Discover and save your favorite recipes with our recipe search. Create personalized collections and get cooking inspiration.",
  keywords: "recipes, cooking, meal planning, recipe search, food, recipes, recipe collection",
  openGraph: {
    title: "Recipe Fren | Recipe Search",
    description: "Discover and save your favorite recipes with our recipe search.",
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
  const user = await currentUser()
  const email = user?.emailAddresses[0].emailAddress
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
