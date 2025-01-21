import Poas from '@/components/Poas'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import * as bip39 from 'bip39'

const page = async () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-[84vh] items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <Poas />
    </Suspense>
  )
}

export default page
