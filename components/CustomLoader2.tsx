import { Loader2 } from "lucide-react"

const CustomLoader2 = () => {
  return (
    <div className="relative flex h-[86vh] flex-row items-center justify-center gap-2 ">
      <Loader2 className="size-10 animate-spin" />
    </div>
  )
}

export default CustomLoader2
