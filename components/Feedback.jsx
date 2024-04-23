"use client"

import { useState } from "react"
import { useWindowSize } from "@uidotdev/usehooks"
import { MessageCircleIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Import the server action
import { submitFeedback } from "./actions"

const MIN_FEEDBACK_LENGTH = 25
const MAX_FEEDBACK_LENGTH = 250
const MAX_NAME_LENGTH = 28
const MIN_NAME_LENGTH = 2

export default function FeedBackDrawer() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { width } = useWindowSize()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      feedback: "",
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      const response = await submitFeedback(data)
      if (response.success) {
        setLoading(false)
        toast(response.message, { type: "success" })
      } else {
        setLoading(false)
        toast(response.message, { type: "error" })
      }
      setOpen(false) // Close the drawer
    } catch (error) {
      console.error(error)
      setLoading(false)
      toast("An unexpected error occurred. Please try again in 60 seconds", {
        type: "error",
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button aria-controls="feedback-dialog" size={"sm"}>
            {width > 412 ? (
              <div className="flex gap-2">
                Feedback
                <MessageCircleIcon className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex gap-2">
                Feedback
                <MessageCircleIcon className="h-5 w-5" />
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave feedback</DialogTitle>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <DialogDescription>
              We&lsquo;d love to hear what went well or how we can improve the
              product experience.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <Input
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: MIN_NAME_LENGTH,
                  message: "Name must be at least 2 characters long",
                },
                maxLength: {
                  value: MAX_NAME_LENGTH,
                  message: `Name must be at most ${MAX_NAME_LENGTH} characters long`,
                },
              })}
              placeholder="name"
            />
            {errors.name && (
              <div className="animate-fade-in text-sm font-bold text-red-600">
                {errors.name.message}
              </div>
            )}
            <Textarea
              {...register("feedback", {
                required: "Message is required",
                minLength: {
                  value: MIN_FEEDBACK_LENGTH,
                  message: `Feedback too short, min is ${MIN_FEEDBACK_LENGTH} chars`,
                },
                maxLength: {
                  value: MAX_FEEDBACK_LENGTH,
                  message: `Feedback too long, max is ${MAX_FEEDBACK_LENGTH} chars`,
                },
              })}
              placeholder="Type your message here."
            />
            {errors.feedback && (
              <div className="animate-fade-in text-sm font-bold text-red-600">
                {errors.feedback.message}
              </div>
            )}
            <Button>
              <div className="flex flex-row gap-3">
                <div>Submit</div>
                <div>
                  {loading && (
                    <div className="h-5 w-5 animate-spin rounded-full border-t-4 border-dotted border-slate-50"></div>
                  )}
                </div>
              </div>
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
