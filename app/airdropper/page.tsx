'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamically import the Airdrop component with no SSR
const AirdropComponent = dynamic(() => import('./Airdrop'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <AirdropComponent />
    </div>
  )
}

export default Page
