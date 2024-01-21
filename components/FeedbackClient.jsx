import * as React from "react"

import { cn } from "@/lib/utils"
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

import { PutObjectCommand, s3Client } from "../lib/s3"
import { useMediaQuery } from "../lib/use-media-query"

export default function FeedBackDrawer() {
  const [open, setOpen] = React.useState(false)
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
              Make changes to your profile here. Click save when youre done.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm />
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
            Your feedback is very much appreciated.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ProfileForm({ className }) {
  function formatDateShorthand(dateString) {
    const date = new Date(dateString)
    return `${date.getFullYear()}${padZero(date.getMonth() + 1)}${padZero(
      date.getDate()
    )}-${padZero(date.getHours())}${padZero(date.getMinutes())}${padZero(
      date.getSeconds()
    )}`
  }

  function padZero(number) {
    return number.toString().padStart(2, "0")
  }

  return (
    <form
      onSubmit={UploadComment}
      className={cn("grid items-start gap-4", className)}
    >
      <div className="grid gap-2">
        <Label htmlFor="username">Feedback</Label>
        <Input id="username" defaultValue=":)" />
      </div>
      <Button type="submit">Send</Button>
    </form>
  )
}
