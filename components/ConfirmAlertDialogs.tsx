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
  isConfirmPreviewDialogOpen,
  setIsConfirmPreviewDialogOpen,
}: {
  children: React.ReactNode
  action: () => void
  loading: boolean
  progress: number
  isConfirmPreviewDialogOpen: boolean
  setIsConfirmPreviewDialogOpen: (isOpen: boolean) => void
}) {
  return (
    <Dialog
      open={isConfirmPreviewDialogOpen}
      onOpenChange={setIsConfirmPreviewDialogOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex w-full flex-col items-center gap-20 pt-4">
            <DialogTitle>Are you sure?</DialogTitle>
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
                {loading && <ProgressDemo progress={progress} />}
              </div>
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

export function ConfirmDownloadAlertDialogForm({
  children,
  handleDownloadPDF,
  loading,
  progress,
  isConfirmDownloadFileDialogOpen,
  setIsConfirmDownloadFileDialogOpen,
}: {
  children: React.ReactNode
  handleDownloadPDF: (fileName: string, isChecked: boolean) => void
  loading: boolean
  progress: number
  isConfirmDownloadFileDialogOpen: boolean
  setIsConfirmDownloadFileDialogOpen: (isOpen: boolean) => void
}) {
  const [fileName, setFileName] = useState("")
  const [isChecked, setIsChecked] = useState(true)

  const onSwitchChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <Dialog
      open={isConfirmDownloadFileDialogOpen}
      onOpenChange={setIsConfirmDownloadFileDialogOpen}
      modal={true}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex w-full items-center justify-center">
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
