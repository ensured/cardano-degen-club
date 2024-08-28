"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TrackPreviousIcon } from "@radix-ui/react-icons"
import { Download, Loader2, RotateCcw, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function Notebook() {
  const [text, setText] = useState("")
  const [filename, setFilename] = useState("")
  const [storageUsed, setStorageUsed] = useState(null)
  const router = useRouter()

  useEffect(() => {
    calculateStorageUsage()
  }, [])

  const calculateStorageUsage = () => {
    const estimatedQuota = 5 * 1024 * 1024 // Assuming 5MB quota (adjust as needed)
    const keys = Object.keys(localStorage)
    let usedSpace = 0
    for (const key of keys) {
      usedSpace += (localStorage.getItem(key) || "").length
    }
    const usagePercentage = Math.floor((usedSpace / estimatedQuota) * 100)
    setStorageUsed(usagePercentage)
  }

  const handleSaveToLocalStorage = () => {
    try {
      localStorage.setItem("notebook-text", text)
      localStorage.setItem("notebook-filename", filename)
      calculateStorageUsage()
      toast.success("Saved to local storage")
    } catch (err) {
      console.error("Error saving to local storage:", err)
      toast.error(`Failed to save to local storage. ` + err)
    }
  }

  const handleLoadFromLocalStorage = () => {
    setText(localStorage.getItem("notebook-text") || "")
    setFilename(localStorage.getItem("notebook-filename") || "")
    toast.success("Loaded from local storage")
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success("File downloaded")
  }

  const handleClear = () => {
    setText("")
    setFilename("")
    toast.info("Notebook cleared")
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Notebook</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              router.push("/recipe-fren")
            }}
          >
            <TrackPreviousIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="You can paste or type a note or recipe here"
          value={text}
          className="min-h-[300px] border-emerald-400/80"
          onChange={(e) => {
            setText(e.target.value)
            if (!filename) {
              setFilename(e.target.value.split("\n")[0].slice(0, 20) + ".txt")
            }
          }}
        />
        <div className="flex space-x-2">
          <Input
            className="flex-grow"
            type="text"
            placeholder="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
          <Button
            onClick={handleDownload}
            disabled={!text.length || !filename.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
        <div className="flex justify-between">
          <div className="space-x-2">
            <Button onClick={handleSaveToLocalStorage} disabled={!text.length}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleLoadFromLocalStorage}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Load
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your current note.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear}>
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
      <CardFooter className="justify-end text-sm text-muted-foreground">
        {storageUsed !== null ? (
          <span>~{100 - storageUsed}% of local storage left</span>
        ) : (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </CardFooter>
    </Card>
  )
}
