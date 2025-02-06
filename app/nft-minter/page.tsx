import NFTMinter from '@/components/NFTMinter'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

const page = async () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-[84vh] items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <NFTMinter />
    </Suspense>
  )
}

export default page
