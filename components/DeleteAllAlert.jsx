import { CheckCircle2Icon, CheckCircleIcon, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { deleteAllFavorites } from "./actions"
import { Button } from "./ui/button"

const DeleteAllAlert = ({ children, setFavorites }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all your
            images stored with your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setFavorites({})
              try {
                const res = deleteAllFavorites()
                toast.promise(
                  res,
                  {
                    loading: "Removing",
                    success: (data) => (
                      <div className="text-zinc-50">
                        {" "}
                        Removed <b>{data.Deleted.length}</b>{" "}
                        {data.Deleted.length > 1 ? "recipes" : "recipe"}
                      </div>
                    ),
                    error: (error) => "Couldn't remove favorites",
                    id: "delete-recipe",
                    style: {
                      minWidth: "250px",
                    },
                  },
                  {
                    className: "bg-slate-500/80",
                    loading: {
                      icon: <Loader2 className="animate-spin text-zinc-950" />,
                    },
                    success: {
                      icon: (
                        <CheckCircle2Icon className=" animate-fadeIn text-zinc-50" />
                      ),
                    },
                  }
                )
              } catch (error) {
                console.error("Error removing favorites:", error)
                toast.error(
                  "Failed to delete favorites. Please try again later."
                )
              }
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteAllAlert
