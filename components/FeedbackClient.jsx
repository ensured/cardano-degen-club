"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
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
import { putObjectInS3Bucket } from "./actions"

export default function FeedBackDrawer() {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Leave feedback</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave feedback</DialogTitle>
            <DialogDescription>
              Your feedback is very important to us.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Have feedback?</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Leave feedback</DrawerTitle>
          <DrawerDescription>
            Your feedback is very important to us.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm setOpen={setOpen} />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function Submit({ setOpen }) {
  const handleButtonClick = () => {
    const nameInput = document.getElementById("name").value
    const feedbackInput = document.getElementById("feedback").value

    if (nameInput.length > 0 && feedbackInput.length > 0) {
      const lastSubmissionTime = localStorage.getItem("lastSubmissionTime")
      const currentTime = new Date().getTime()

      if (!lastSubmissionTime || currentTime - lastSubmissionTime >= 60000) {
        // It's been at least 60 seconds since the last submission
        toast("Your feedback has been submitted, thanks!", { type: "success" })
        setOpen(false)
        putObjectInS3Bucket(nameInput, feedbackInput)
        localStorage.setItem("lastSubmissionTime", currentTime)
      } else {
        // Show a toast with the time left until the next submission
        const timeLeft = Math.ceil(
          (60000 - (currentTime - lastSubmissionTime)) / 1000
        )
        toast(`Please wait ${timeLeft} seconds before submitting again.`, {
          type: "warning",
        })
      }
    } else {
      // Show an error toast or handle the case where inputs are not valid
      toast("Please enter both a name and feedback before submitting.", {
        type: "error",
      })
    }
  }

  const status = useFormStatus()

  return (
    <Button disabled={status.pending} onClick={handleButtonClick}>
      Submit
    </Button>
  )
}

function ProfileForm({ setOpen }) {
  return (
    <div className="flex flex-col gap-2 px-4">
      <Input
        onPointerDown={(e) => e.stopPropagation()}
        name="name"
        id="name"
        placeholder="name"
      />
      <Textarea
        placeholder="Type your message here."
        id="feedback"
        name="feedback"
        onPointerDown={(e) => e.stopPropagation()}
      />
      <Submit setOpen={setOpen} />
    </div>
  )
}
