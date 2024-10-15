"use client"

import { Progress } from "@/components/ui/progress"

export function ProgressDemo({ progress }: { progress: number }) {
  return <Progress value={progress} className="w-full bg-purple-700" />
}
