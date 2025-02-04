'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from './ui/textarea'
import { MessageCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

export function FeedbackForm() {
  const [feedbackText, setFeedbackText] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': window.cardano?.selectedAddress || '',
        },
        body: JSON.stringify({ feedback: feedbackText }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback')
      }

      setIsSubmitted(true)
      setFeedbackText('')
      setTimeout(() => {
        setIsSubmitted(false)
        // setIsOpen(false)
      }, 1600)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
          <MessageCircleIcon className="size-5 sm:size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>
        {isSubmitted ? (
          <div className="p-4 text-center text-green-600">Thank you for your feedback!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your feedback..."
              className="min-h-[100px] w-full rounded-md border p-2 text-sm"
              required
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Feedback</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
