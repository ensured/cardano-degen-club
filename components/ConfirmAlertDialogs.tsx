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

import { ProgressDemo } from "./Progress"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function ConfirmPreviewAlertDialog({
  children,
  action,
  loading,
  progress,
}: {
  children: React.ReactNode
  action: () => void
  loading: boolean
  progress: Number
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will generate a new pdf for you to view.
          </DialogDescription>
          <DialogDescription>
            <div className="relative w-full">
              <Button onClick={action} className="flex w-full" size={"sm"}>
                <div className="flex flex-row items-center  justify-end gap-1 ">
                  Continue
                  {loading ? (
                    <Loader2 className="left-2 w-5 animate-spin md:w-8" />
                  ) : (
                    <File className="left-2 w-5 md:w-8" />
                  )}
                </div>
              </Button>
              <div className="absolute top-8 w-full py-3">
                {loading && <ProgressDemo progress={progress as number} />}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogDescription className="flex w-full justify-center p-2 font-serif text-xs italic">
            It might take a minute to process all of the images.
          </DialogDescription>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ConfirmDownloadAlertDialogForm({
  children,
  handleDownloadPDF,
  loading,
  progress,
}: {
  children: React.ReactNode
  handleDownloadPDF: (fileName: string, isChecked: boolean) => void
  loading: boolean
  progress: number
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
          <div className="container flex flex-col gap-3">
            <div className="flex items-center justify-center">
              <Input
                onChange={(e) => {
                  setFileName(e.target.value)
                }}
                type="text"
                placeholder="filename"
                value={fileName}
                className="w-60 font-serif"
              />
              <div className="pl-1 font-serif text-sm font-bold">.pdf</div>
            </div>
            <div className="mb-4 flex w-full items-center justify-center gap-2">
              <Switch
                id="airplane-mode"
                defaultChecked={true}
                checked={isChecked}
                onCheckedChange={onSwitchChange}
              />
              <Label htmlFor="airplane-mode" className=" font-serif">
                Append date and time to filename?
              </Label>
            </div>
            <div className="relative w-full">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleDownloadPDF(fileName, isChecked)
                }}
                className="flex w-full"
                size={"sm"}
              >
                <div className="flex flex-row items-center justify-center gap-1">
                  {loading ? (
                    <Loader2 className="left-2 w-5 animate-spin md:w-8" />
                  ) : (
                    <Download className="left-2 w-5 md:w-8" />
                  )}
                  Download
                </div>
                <div className="absolute top-8 w-full py-3">
                  {loading && <ProgressDemo progress={progress as number} />}
                </div>
              </Button>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogDescription className="flex w-full justify-center p-2 font-serif text-xs italic">
            It might take a minute to process all of the images.
          </DialogDescription>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}