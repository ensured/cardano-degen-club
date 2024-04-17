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
                const res = await deleteAllFavorites()
                toast.success(`Removed ${res.Deleted.length} recipes!`)
              } catch (error) {
                console.error("Error deleting favorites:", error)
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
