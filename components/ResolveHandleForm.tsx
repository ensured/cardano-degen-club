/* eslint-disable tailwindcss/enforces-shorthand */
"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

type ResolveHandleFormProps = {
  handleSubmit: () => void
  walletAddress: { stakeAddress: string; image: string; address: string } | null
  loadingAdahandle: boolean
  handleName: string
  setHandleName: (name: string) => void
}

const ResolveHandleForm = ({
  handleSubmit,
  walletAddress,
  loadingAdahandle,
  handleName,
  setHandleName,
}: ResolveHandleFormProps) => {
  return (
    <div>
      <form
        className="col-span-1 flex w-full flex-col items-center justify-center gap-2 p-5 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <h1 className="flex items-center gap-2 text-center font-bold">
          <div className="flex flex-col gap-2 text-xl md:text-2xl">
            Adahandle Resolver
          </div>
        </h1>
        <Input
          type="text"
          placeholder="$adahandle"
          value={handleName}
          className="w-60 text-base md:text-xl"
          onChange={(e) => setHandleName(e.target.value)}
        />
        <Button type="submit" className="w-[15rem]" disabled={loadingAdahandle}>
          <span className="relative flex flex-row items-center gap-2">
            <span className="whitespace-nowrap">Search</span>
            <span className="flex items-center">
              {loadingAdahandle && (
                <Loader2 className="absolute -right-3.5 size-5 animate-spin text-white" />
              )}
            </span>
          </span>
        </Button>
      </form>
      {walletAddress?.stakeAddress && (
        <div className="col-span-1 overflow-hidden break-all border-t border-border bg-secondary/40 p-6 text-center shadow-md">
          <div className="relative grid w-full grid-cols-1 items-center gap-2 sm:grid-cols-3">
            <Image
              src={
                walletAddress.image && walletAddress.image.startsWith("ipfs://")
                  ? `https://ipfs.io/ipfs/${walletAddress.image.replace("ipfs://", "")}`
                  : walletAddress.image
              }
              width={800}
              height={800}
              alt="wallet image"
              className="col-span-1 mx-auto mb-1 size-36 object-cover sm:mb-0"
            />
            <div className="col-span-1 flex flex-col sm:p-2">
              <span className="flex items-center justify-center gap-1 text-muted-foreground">
                <span className="text-base sm:text-lg">Stake Address</span>{" "}
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6 sm:h-[1.6rem] sm:w-[1.55rem]"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress.stakeAddress)
                    toast.success("Copied stake address")
                  }}
                >
                  <CopyIcon className="size-3 sm:size-3.5" />
                </Button>
              </span>
              <span className="line-clamp-1 text-center sm:line-clamp-3">
                {walletAddress.stakeAddress}
              </span>
            </div>
            <div className="col-span-1 flex flex-col sm:p-2">
              <span className="flex items-center justify-center gap-1 text-muted-foreground">
                <span className="text-base sm:text-lg">Address</span>{" "}
                <Button
                  size="icon"
                  className="h-6 w-6 sm:size-[1.55rem]"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress.address)
                    toast.success("Copied address")
                  }}
                >
                  <CopyIcon className="size-3 sm:size-3.5" />
                </Button>
              </span>
              <span className="line-clamp-1 text-center sm:line-clamp-3">
                {walletAddress
                  ? walletAddress.address
                  : "No wallet address found"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResolveHandleForm
