import { motion } from "framer-motion"
import { FileText, Loader2 } from "lucide-react"

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
  return (
    <Dialog
      open={isConfirmPreviewDialogOpen}
      onOpenChange={setIsConfirmPreviewDialogOpen}
      modal={true}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center justify-center px-8">
          <DialogDescription className="flex h-12 w-full justify-center p-2 font-serif text-xs italic">
            {loading ? (
              <motion.div
                className="w-full "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
              >
                <ProgressDemo progress={progress as number} />
                <DialogDescription className="flex justify-center">
                  {progress.toFixed(0)}%
                </DialogDescription>
              </motion.div>
            ) : (
              "Are you sure?"
            )}
          </DialogDescription>

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
