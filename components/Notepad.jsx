"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TrackPreviousIcon } from "@radix-ui/react-icons"
import { useWindowSize } from "@uidotdev/usehooks"
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

export default function Notepad() {
  const [text, setText] = useState("")
  const [filename, setFilename] = useState("")
  const [storageUsed, setStorageUsed] = useState(null)
  const { width, height } = useWindowSize()

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
      localStorage.setItem("notepad-text", text)
      localStorage.setItem("notepad-filename", filename)
      calculateStorageUsage()
      toast.success("Saved to local storage")
    } catch (err) {
      console.error("Error saving to local storage:", err)
      toast.error(`Failed to save to local storage. ` + err)
    }
  }

  const handleLoadFromLocalStorage = () => {
    setText(localStorage.getItem("notepad-text") || "")
    setFilename(localStorage.getItem("notepad-filename") || "")
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
    toast.info("Notepad cleared")
  }

  return (
    <Card className="mx-auto flex h-[calc(100vh-5.5rem)] w-full max-w-7xl flex-col rounded-none border-0 ">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="text-2xl font-bold">Notepad</span>
          <Link href="/recipe-fren">
            <Button variant="outline">
              <TrackPreviousIcon className="mr-2 size-5" />
              {width <= 342 ? "Back" : "Back to recipe fren"}
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="grow space-y-6 overflow-auto pb-6">
        <Textarea
          placeholder="You can paste or type a note or recipe here"
          value={text}
          className="min-h-[44vh] border-emerald-400/80 text-lg"
          onChange={(e) => {
            setText(e.target.value)
          }}
        />
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            className="grow text-lg"
            type="text"
            placeholder="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleDownload}
            disabled={!text.length || !filename.length}
          >
            <Download className="mr-2 size-5" />
            Download
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            size="lg"
            className="w-full"
            onClick={handleSaveToLocalStorage}
            disabled={!text.length}
          >
            <Save className="mr-2 size-5" />
            Save
          </Button>
          <Button
            size="lg"
            className="w-full"
            onClick={handleLoadFromLocalStorage}
          >
            <RotateCcw className="mr-2 size-5" />
            Load
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="w-full">
                <Trash2 className="mr-2 size-5" />
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
      <CardFooter className="shrink-0 justify-end py-1 text-sm text-muted-foreground">
        {storageUsed !== null ? (
          <span>~{100 - storageUsed}% of local storage left</span>
        ) : (
          <Loader2 className="size-5 animate-spin" />
        )}
      </CardFooter>
    </Card>
  )
}
