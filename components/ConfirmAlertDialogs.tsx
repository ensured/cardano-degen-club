import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { motion } from "framer-motion"
import { FileText, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  return (
    <Dialog
      open={isConfirmPreviewDialogOpen}
      onOpenChange={setIsConfirmPreviewDialogOpen}
      modal={true}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <VisuallyHidden.Root>
          <DialogTitle className="flex w-full justify-center text-xl font-bold">
            Preview
          </DialogTitle>
        </VisuallyHidden.Root>
        <div className="mt-8 flex h-8 w-full justify-center pb-4 font-serif text-lg italic">
          {loading ? (
            <motion.div
              className="w-full "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12 }}
            >
              <div className="flex w-full flex-col items-center justify-center">
                <ProgressDemo progress={progress as number} />
                {progress.toFixed(0)}%
              </div>
            </motion.div>
          ) : (
            "Are you sure?"
          )}
        </div>

        <DialogDescription className="relative w-full pb-5">
          <Button
            className="w-full"
            size={"sm"}
            disabled={loading ? true : false}
            onClick={() => {
              handlePreviewPDF()
              setIsConfirmPreviewDialogOpen(false)
            }}
          >
            <div className="flex items-center justify-center gap-1">
              {loading ? (
                <Loader2 className="w-5 animate-spin md:w-8" />
              ) : (
                <FileText className="w-5 md:w-8" />
              )}
              Preview
            </div>
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
