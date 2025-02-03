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
        },
        body: JSON.stringify({ feedback: feedbackText }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFeedbackText('')
        setTimeout(() => {
          setIsSubmitted(false)
          setIsOpen(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <MessageCircleIcon className="h-4 w-4" />
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
