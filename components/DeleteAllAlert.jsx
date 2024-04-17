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
                toast.promise(res, {
                  loading: "Removing",
                  success: (data) => (
                    <div>
                      Removed <b>{data.Deleted.length}</b>{" "}
                      {data.Deleted.length > 1 ? "recipes" : "recipe"}
                    </div>
                  ),
                  error: (error) => <div>{error}</div>,
                  duration: 2000,
                  id: "delete-all",
                })
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
