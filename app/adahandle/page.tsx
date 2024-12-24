"use client"
import Animation from "@/components/Animation"
import { toast } from "sonner"
import ResolveHandleForm from "@/components/ResolveHandleForm"
import { useState } from "react"
import { getAddressFromHandle } from "../actions"

const Page = () => {
  const [handleName, setHandleName] = useState("")
  const [walletAddress, setWalletAddress] = useState<{
    stakeAddress: string
    image: string
    address: string
  } | null>(null)
  const [loadingAdahandle, setLoadingAdahandle] = useState(false)

  const handleSubmit = async () => {
    setLoadingAdahandle(true) // Set loading state to true
    try {
      const { stakeAddress, image, address, error } =
        await getAddressFromHandle(handleName)
      // Check for rate limit error
      if (error || !stakeAddress) {
        toast.error(error || "No wallet address found") // Show toast notification
        return
      }

      setWalletAddress({ stakeAddress, image, address })
      const newHandleName = handleName.toLowerCase().replace("$", "")
      setHandleName(newHandleName)
    } catch (error) {
      toast.error("Something went wrong, please try again with a new handle")
    } finally {
      setLoadingAdahandle(false)
    }
  }
  return (
    <Animation>
      <ResolveHandleForm
        handleSubmit={handleSubmit}
        walletAddress={walletAddress}
        loadingAdahandle={loadingAdahandle}
        handleName={handleName}
        setHandleName={setHandleName}
      />
    </Animation>
  )
}

export default Page
