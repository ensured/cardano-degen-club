/* eslint-disable tailwindcss/enforces-shorthand */
'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, XSquareIcon, SearchIcon } from 'lucide-react'
import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useEffect } from 'react'

type ResolveHandleFormProps = {
  handleSubmit: () => void
  walletAddress: {
    stakeAddress: string
    image: string
    address: string
  } | null
  walletState: any
  loadingAdahandle: boolean
  handleName: string
  setHandleName: (name: string) => void
}

const ResolveHandleForm = ({
  handleSubmit,
  walletState,
  walletAddress,
  loadingAdahandle,
  handleName,
  setHandleName,
}: ResolveHandleFormProps) => {
  useEffect(() => {
    if (walletState?.adaHandle?.handle) {
      setHandleName(walletState?.adaHandle?.handle)
    }
  }, [walletState?.adaHandle?.handle])

  return (
    <div className="mt-4 rounded-md">
      <h2 className="text-center text-2xl font-bold text-primary md:text-3xl">Find $handle</h2>
      <form
        className="col-span-1 flex w-full flex-col items-center justify-center gap-2 p-4"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border/80 bg-secondary/40 py-6">
          <div className="flex flex-row items-center justify-center rounded-t-md px-4 py-2 transition-all focus-within:border-primary/40 focus-within:shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 28 44">
              <path
                id="logo_S"
                data-name="logo S"
                d="M6.847,2.28q0-.819,1.269-1.531A6.543,6.543,0,0,1,11.458,0q1.6,0,2.071.713a1.691,1.691,0,0,1,.333.926V2.707a11.626,11.626,0,0,1,5.245,1.5c.4.284.6.558.6.818a10.97,10.97,0,0,1-.835,3.988q-.8,2.137-1.568,2.138a4.05,4.05,0,0,1-.869-.321A9.124,9.124,0,0,0,12.76,9.793a4.669,4.669,0,0,0-1.97.284.954.954,0,0,0-.5.891c0,.38.246.678.735.891a10.607,10.607,0,0,0,1.8.569,12.063,12.063,0,0,1,2.372.749,13.116,13.116,0,0,1,2.4,1.281A5.632,5.632,0,0,1,19.442,16.7a6.6,6.6,0,0,1,.735,2.991,10.022,10.022,0,0,1-.268,2.528,7.742,7.742,0,0,1-.936,2.065A5.961,5.961,0,0,1,17,26.206a9.615,9.615,0,0,1-3.141,1.212v.569q0,.819-1.269,1.531a6.531,6.531,0,0,1-3.34.747q-1.6,0-2.071-.711a1.7,1.7,0,0,1-.335-.926V27.56a21.3,21.3,0,0,1-3.775-.676Q0,25.995,0,24.961a16.977,16.977,0,0,1,.534-4.13q.535-2.172,1.269-2.173.133,0,2.772.962a12.92,12.92,0,0,0,3.976.962,3.425,3.425,0,0,0,1.736-.284,1.077,1.077,0,0,0,.4-.891c0-.38-.246-.7-.735-.962a6.491,6.491,0,0,0-1.838-.676A15.515,15.515,0,0,1,3.34,15.74a5.472,5.472,0,0,1-1.836-2.1A6.823,6.823,0,0,1,.768,10.4q0-6.553,6.079-7.655Z"
                transform="translate(0 9.487)"
                fill="#0cd15b"
              ></path>
            </svg>
            <Input
              type="text"
              placeholder="Enter your handle..."
              value={handleName}
              className="w-60 text-lg font-medium placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 md:text-xl"
              onChange={(e) => setHandleName(e.target.value)}
            />
          </div>
          {!handleName && (
            <p className="mt-2 text-sm text-muted-foreground/60">
              Type your handle name (e.g. &rdquo;$satoshi&rdquo;)
            </p>
          )}
          <Button
            type="submit"
            className="w-[16.23rem] bg-primary/90 py-6 text-lg transition-all hover:bg-primary/100 hover:shadow-lg"
            disabled={loadingAdahandle || handleName === '' || handleName.length < 2}
          >
            <span className="relative flex flex-row items-center gap-2">
              <SearchIcon className="size-5" />
              <span className="whitespace-nowrap">Resolve Handle</span>
              <span className="flex items-center">
                {loadingAdahandle && (
                  <Loader2 className="absolute -right-3.5 size-5 animate-spin text-white" />
                )}
              </span>
            </span>
          </Button>
        </div>
      </form>

      {/* output */}
      {walletAddress?.stakeAddress && (
        <div className="col-span-1 mx-8 max-w-[44rem] overflow-hidden break-all rounded-md border border-border bg-secondary/20 p-6 text-center sm:mx-auto sm:max-w-2xl">
          <div className="z-20">
            <Image
              src={
                walletAddress.image && walletAddress.image.startsWith('ipfs://')
                  ? `https://ipfs.io/ipfs/${walletAddress.image.replace('ipfs://', '')}`
                  : walletAddress.image
              }
              width={800}
              height={800}
              alt="wallet image"
              className="col-span-1 mx-auto mb-1 size-36 object-cover sm:mb-0"
            />
            <div className="col-span-1 grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
              <div className="flex flex-col sm:p-2 sm:pl-8">
                <span className="flex items-center justify-center gap-1 text-muted-foreground">
                  <span className="text-base sm:text-lg">Stake Address</span>{' '}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-6 w-6 border border-primary/70 sm:h-[1.6rem] sm:w-[1.55rem]"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress.stakeAddress)
                      toast.success('Copied stake address')
                    }}
                  >
                    <CopyIcon className="size-3 sm:size-3.5" />
                  </Button>
                </span>
                <span className="line-clamp-1 text-center sm:line-clamp-3">
                  {walletAddress.stakeAddress}
                </span>
              </div>
              <div className="flex flex-col sm:p-2 sm:pr-8">
                <span className="flex items-center justify-center gap-1 text-muted-foreground">
                  <span className="text-base sm:text-lg">Address</span>{' '}
                  <Button
                    size="icon"
                    className="h-6 w-6 border border-primary/70 sm:size-[1.55rem]"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress.address)
                      toast.success('Copied address')
                    }}
                  >
                    <CopyIcon className="size-3 sm:size-3.5" />
                  </Button>
                </span>
                <span className="line-clamp-1 text-center sm:line-clamp-3">
                  {walletAddress ? walletAddress.address : 'No wallet address found'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResolveHandleForm
