import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ProgressDemo } from "./Progress"
import { Button } from "./ui/button"

export function ConfirmPreviewAlertDialog({
  children,
  handlePreviewPDF,
  loading,
  progress,
  isConfirmPreviewDialogOpen,
  setIsConfirmPreviewDialogOpen,
}: {
  children: React.ReactNode
  handlePreviewPDF: () => void
  loading: boolean
  progress: number
  isConfirmPreviewDialogOpen: boolean
  setIsConfirmPreviewDialogOpen: (isOpen: boolean) => void
}) {
  const [fileName, setFileName] = useState("")
  // const [isChecked, setIsChecked] = useState(true)

  // const onSwitchChange = () => {
  //   setIsChecked(!isChecked)
  // }

  return (
    <Dialog
      open={isConfirmPreviewDialogOpen}
      onOpenChange={setIsConfirmPreviewDialogOpen}
      modal={true}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-full">
              <Button
                className="w-full"
                size={"sm"}
                onClick={() => {
                  handlePreviewPDF()
                  setIsConfirmPreviewDialogOpen(false)
                }}
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
                  <motion.div
                    className="absolute top-full w-full py-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.12 }}
                  >
                    <ProgressDemo progress={progress as number} />
                    <DialogDescription className="flex justify-center">
                      {progress.toFixed(0)}%
                    </DialogDescription>
                  </motion.div>
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
