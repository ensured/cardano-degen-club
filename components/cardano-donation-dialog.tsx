'use client'

import { useState } from 'react'
import { Copy, Check, Heart } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function CardanoDonationDialog() {
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const cardanoAddress =
    'addr1qxyj9sqrzpwq9v4ylzr3m59rzxcusdqytulpz8j8wpd7k75ya8f335kz79mf43nwquzgnylgzmt0wdyh2k2zzleh7c7qmkdw9a'

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cardanoAddress)
      setIsCopied(true)
      toast({
        title: 'Address copied!',
        description: 'The Cardano ADA address has been copied to your clipboard.',
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address: ', err)
      toast({
        title: 'Copy failed',
        description: 'Please try copying the address manually.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="group mt-2">
          <Heart className="animate-heartbeat h-4 w-4 origin-center fill-red-600 stroke-black stroke-[3.5px] transition-all duration-300 group-active:scale-110 group-active:stroke-[4px]" />
          Feel like donating?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donate Cardano ADA</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <p className="break-all text-sm text-muted-foreground">{cardanoAddress}</p>
          </div>
          <Button size="sm" className="px-3" onClick={copyToClipboard}>
            <span className="sr-only">Copy</span>
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
