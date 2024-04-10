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
          <div className="flex flex-col items-center justify-center p-4">
            <div className="mb-4">
              <DialogTitle>Are you sure?</DialogTitle>
            </div>
            <div className="relative w-full">
              <Button
                onClick={() => {
                  action()
                  setIsConfirmPreviewDialogOpen(false)
                }}
                className="w-full"
                size={"sm"}
              >
                <div className="relative flex items-center justify-center gap-1">
                  Continue
                  {loading && (
                    <Loader2 className="absolute right-[4.20rem] w-5 animate-spin md:w-8" />
                  )}
                </div>
              </Button>
              {loading && (
                <div className="absolute top-full w-full py-1 text-green">
                  <ProgressDemo progress={progress as number} />
                  <DialogDescription>{progress.toFixed(0)}%</DialogDescription>
                </div>
              )}
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
          <div className="flex flex-col items-center justify-center p-4">
            <div className="mb-4 flex items-center">
              <Input
                onChange={(e) => {
                  setFileName(e.target.value)
                }}
                type="text"
                placeholder="Filename"
                value={fileName}
                className="w-60 rounded-md border p-2"
              />
              <div className="ml-2 text-sm font-bold">.pdf</div>
            </div>
            <div className="mb-4 flex items-center">
              <Switch
                id="airplane-mode"
                defaultChecked={true}
                checked={isChecked}
                onCheckedChange={onSwitchChange}
                className="mr-2"
              />
              <Label htmlFor="airplane-mode" className="text-sm font-bold">
                Append date and time to filename?
              </Label>
            </div>
            <div className="relative w-full">
              <Button
                onClick={() => {
                  handleDownloadPDF(fileName, isChecked)
                  setIsConfirmDownloadFileDialogOpen(false)
                }}
                className="w-full"
                size={"sm"}
              >
                <div className="flex items-center justify-center gap-1">
                  {loading ? (
                    <Loader2 className="w-5 animate-spin md:w-8" />
                  ) : (
                    <Download className="w-5 md:w-8" />
                  )}
                  Download
                </div>
                {loading && (
                  <div className="absolute top-full w-full py-1 text-green">
                    <ProgressDemo progress={progress as number} />
                    <DialogDescription>
                      {progress.toFixed(0)}%
                    </DialogDescription>
                  </div>
                )}
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
