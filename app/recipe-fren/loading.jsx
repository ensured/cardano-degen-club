import { Loader2 } from "lucide-react"

const Loading = () => {
  return (
    <div className="relative flex h-[86vh] flex-row items-center justify-center gap-2 ">
      <Loader2 className="animate-spin" />
    </div>
  )
}

export default Loading
