'use client'
import { Toaster } from 'react-hot-toast'

import Animation from '@/components/Animation'
import SearchRecipes from '@/components/SearchRecipes'
import { useUser } from '@clerk/nextjs'
import { useWallet } from '@/contexts/WalletContext'
import UserLoginButtons from '@/components/UserLoginButtons'

// export const metadata = {
// 	title: 'Recipe Fren | Recipe Search and Collection',
// 	description:
// 		'Discover and save your favorite recipes with our recipe search. Create personalized collections and get cooking inspiration.',
// 	keywords: 'recipes, cooking, meal planning, recipe search, food, recipes, recipe collection',
// 	openGraph: {
// 		title: 'Recipe Fren | Recipe Search',
// 		description: 'Discover and save your favorite recipes with our recipe search.',
// 		type: 'website',
// 	},
// }

const TOAST_OPTIONS = {
  className: 'dark:bg-zinc-950 dark:text-slate-100',
  position: 'bottom-center' as const,
  success: {
    style: {
      background: 'green',
    },
  },
  error: {
    style: {
      background: 'red',
    },
  },
}

const RecipeFrenPage = () => {
  const { user } = useUser()
  const { walletState } = useWallet()
  const userEmail = user?.emailAddresses[0]?.emailAddress

  if (!userEmail && !walletState.stakeAddress) {
    return (
      <Animation>
        <div className="flex w-full justify-center pt-6 text-center">
          <div className="flex flex-col items-center justify-center gap-2 p-2 text-xl sm:text-2xl">
            👋 Welcome to Recipe Fren!
            <div className="max-w-[22rem] p-4 text-sm dark:text-gray-400/60 md:max-w-[26rem]">
              Sign in to unlock all the delicious recipes and the ability to save your favorite
              recipes and even download them as a formatted PDF file!
            </div>
            <div className="flex flex-row items-center justify-center rounded-lg border border-border text-xl sm:text-2xl">
              <UserLoginButtons extraText="Sign in" />
            </div>
          </div>
        </div>
      </Animation>
    )
  }

  return (
    <Animation>
      <SearchRecipes />
      <Toaster toastOptions={TOAST_OPTIONS} />
    </Animation>
  )
}

export default RecipeFrenPage
