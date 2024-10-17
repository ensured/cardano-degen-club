import { useState } from "react"
import { CheckCircle2Icon, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { deleteAllFavorites } from "./actions"
// ShadCN UI Dialog
import { Button } from "./ui/button"

const DeleteAllAlert = ({ children, setFavorites }) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete all your
            images stored with your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              setFavorites({})
              try {
                const res = deleteAllFavorites()
                toast.promise(
                  res,
                  {
                    loading: "Removing",
                    success: (data) => (
                      <div className="text-white">
                        Removed <b>{data.Deleted.length}</b>{" "}
                        {data.Deleted.length > 1 ? "recipes" : "recipe"}
                      </div>
                    ),
                    error: (error) => "Couldn't remove favorites",
                    id: "delete-recipe",
                  },
                  {
                    className: "bg-slate-500/80 min-w-[200px]",
                    loading: {
                      icon: <Loader2 className="animate-spin text-zinc-950" />,
                    },
                    success: {
                      icon: (
                        <CheckCircle2Icon className="animate-fadeIn text-white" />
                      ),
                    },
                  }
                )
                setOpen(false)
              } catch (error) {
                console.error("Error removing favorites:", error)
                toast.error(
                  "Failed to delete favorites. Please try again later."
                )
              }
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteAllAlert
