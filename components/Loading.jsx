import React from "react"

import { cn } from "@/lib/utils"

function Loader({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    >
      {/* You can customize the loader content here if needed */}
    </div>
  )
}

export { Loader }
