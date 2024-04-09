import { useState } from "react"
import { Download, File, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function ConfirmPreviewAlertDialog({
  children,
  action,
  loading,
}: {
  children: React.ReactNode
  action: () => void
  loading: boolean
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will generate a new pdf for you to view.
            <div className="font-bold italic">
              {" "}
              It might take a minute to process all of the images.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={action}>
            <div className="flex flex-row items-center justify-center gap-1">
              Continue
              {loading ? (
                <Loader2 className="left-2 w-5 animate-spin md:w-8" />
              ) : (
                <File className="left-2 w-5 md:w-8" />
              )}
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ConfirmDownloadAlertDialogForm({
  children,
  handleDownloadPDF,
  loading,
}: {
  children: React.ReactNode
  handleDownloadPDF: (fileName: string, isChecked: boolean) => void
  loading: boolean
}) {
  const [fileName, setFileName] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const [isChecked, setIsChecked] = useState(true)

  const onOpenChange = () => {
    setIsOpen(!isOpen)
  }

  const onSwitchChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogDescription className="italic">
            It might take a minute to process all of the images.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="container flex w-full flex-col gap-2">
            <Input
              onChange={(e) => {
                setFileName(e.target.value)
              }}
              type="text"
              placeholder="filename"
              value={fileName}
            />

            <div className="flex items-center justify-between gap-x-1 ">
              <Label htmlFor="airplane-mode" className="w-full">
                Append date and time to filename?
              </Label>

              <Switch
                id="airplane-mode"
                defaultChecked={true}
                checked={isChecked}
                onCheckedChange={onSwitchChange}
              />
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleDownloadPDF(fileName, isChecked)
              }}
            >
              <div className="flex flex-row items-center justify-center gap-1">
                {loading ? (
                  <Loader2 className="left-2 w-5 animate-spin md:w-8" />
                ) : (
                  <Download className="left-2 w-5 md:w-8" />
                )}
                Download
              </div>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
