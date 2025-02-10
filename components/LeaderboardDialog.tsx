'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trophy } from 'lucide-react'
import { Leaderboard } from './Leaderboard'
import Button3D from './3dButton'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export function LeaderboardDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button3D variant="outline" className="h-10 w-auto">
          Leaderboard <Trophy className="h-[1.2rem] w-[1.2rem]" />
        </Button3D>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <VisuallyHidden>
          <DialogDescription>lol</DialogDescription>
        </VisuallyHidden>
        <DialogHeader>
          <DialogTitle>Global Leaderboard</DialogTitle>
        </DialogHeader>

        <Leaderboard />
      </DialogContent>
    </Dialog>
  )
}
