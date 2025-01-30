'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamically import the Airdrop component with no SSR
const AirdropComponent = dynamic(() => import('./Airdrop'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[69vh] items-center justify-center">
      <Loader2 className="h-9 w-9 animate-spin text-primary" />
    </div>
  ),
})

const Page = () => {
  return (
    <div className="mt-10 flex flex-col items-center justify-center">
      <AirdropComponent />
      {/* <Button variant="outline">coming soon</Button> */}
    </div>
  )
}

export default Page
