"use client"

import { useState } from "react"
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useMediaQuery } from "../lib/use-media-query"
// Import the server action
import { submitFeedback } from "./actions"

const MAX_FEEDBACK_LENGTH = 100
const MAX_NAME_LENGTH = 24
export default function FeedBackDrawer() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  // const isDesktop = useMediaQuery("(min-width: 768px)")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    if (!data.name && !data.feedback) {
      setLoading(false)
      return
    }

    // Validate name
    if (!data.name || !/^[a-zA-Z\s-]+$/.test(data.name)) {
      toast(
        "Invalid name. Please enter a valid name without special characters.",
        {
          type: "error",
        }
      )
      setLoading(false)
      return
    }

    // Validate feedback
    if (!data.feedback || !/^[^\s]+$/.test(data.feedback)) {
      toast(
        "Invalid feedback. Please enter a valid message without leading/trailing spaces.",
        {
          type: "error",
        }
      )
      setLoading(false)
      return
    }

    if (data.feedback.length > MAX_FEEDBACK_LENGTH) {
      const remainingCharsNeeded = data.feedback.length - MAX_FEEDBACK_LENGTH
      toast(
        `Feedback is too long, remove ${remainingCharsNeeded} ${
          remainingCharsNeeded === 1 ? "char" : "chars"
        } `,
        {
          type: "error",
        }
      )
      setLoading(false)
      return
    }

    if (data.name.length > MAX_NAME_LENGTH) {
      const remainingCharsNeeded = data.name.length - MAX_NAME_LENGTH
      toast(
        `Name is too long, remove ${remainingCharsNeeded} ${
          remainingCharsNeeded === 1 ? "char" : "chars"
        }`,
        {
          type: "error",
        }
      )
      setLoading(false)
      return
    }

    try {
      const response = await submitFeedback(data.name, data.feedback)
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
          <Button variant="outline" aria-controls="feedback-dialog">
            Leave feedback
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave feedback</DialogTitle>
            <DialogDescription>
              Your feedback is very important to me.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <Input
              {...register("name", { required: true })}
              placeholder="name"
              error={errors.name}
            />
            {errors.name && (
              <div className="animate-fade-in text-sm font-bold text-red-600">
                This field is required
              </div>
            )}
            <Textarea
              {...register("feedback", { required: true })}
              placeholder="Type your message here."
              error={errors.feedback}
            />
            {errors.feedback && (
              <div className="animate-fade-in text-sm font-bold text-red-600">
                This field is required
              </div>
            )}
            <Button type="submit">
              <div className="flex flex-row gap-3">
                <div>Submit Feedback</div>
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

      {/* old code for if I want it as a button on the page. */}
      {/* {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" aria-controls="feedback-dialog">
              Have feedback about my site?
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Leave feedback</DialogTitle>
              <DialogDescription>
                Your feedback is very important to me.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-2"
            >
              <Input
                {...register("name", { required: true })}
                placeholder="name"
                error={errors.name}
                errorMessage="Please enter your name."
              />
              {errors.name && (
                <div className="text-sm font-bold text-red-600">
                  This field is required
                </div>
              )}
              <Textarea
                {...register("feedback", { required: true })}
                placeholder="Type your message here."
                error={errors.feedback}
                errorMessage="Please enter your feedback."
              />
              {errors.feedback && (
                <div className="text-sm font-bold text-red-600">
                  This field is required
                </div>
              )}
              <Button type="submit">Submit</Button>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" aria-controls="feedback-dialog">
              Have feedback?
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Leave feedback</DrawerTitle>
              <DrawerDescription>
                Your feedback is very important to me.
              </DrawerDescription>
            </DrawerHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-2 px-4"
            >
              <Input
                {...register("name", { required: true })}
                placeholder="name"
                error={errors.name}
                errorMessage="Please enter your name."
                onPointerDown={(e) => e.stopPropagation()}
              />
              {errors.name && (
                <div className="text-sm font-bold text-red-600">
                  This field is required
                </div>
              )}
              <Textarea
                {...register("feedback", { required: true })}
                placeholder="Type your message here."
                error={errors.feedback}
                errorMessage="Please enter your feedback."
                onPointerDown={(e) => e.stopPropagation()}
              />
              {errors.feedback && (
                <div className="text-sm font-bold text-red-600">
                  This field is required
                </div>
              )}
              <Button type="submit">Submit</Button>
            </form>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )} */}
    </>
  )
}
