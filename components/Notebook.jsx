"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
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

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"

export default function Notebook() {
  const [text, setText] = useState("")
  const [filename, setFilename] = useState("")
  const [storageUsed, setStorageUsed] = useState(null)

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
    } catch (err) {
      console.error("Error saving to local storage:", err)
      toast.error(`Failed to save to local storage. ` + err)
      return
    }
  }

  const handleLoadFromLocalStorage = () => {
    setText(localStorage.getItem("notebook-text") || "")
    setFilename(localStorage.getItem("notebook-filename") || "")
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setText("")
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-2.5">
      <Textarea
        placeholder="You can paste or type a note or recipe here"
        value={text}
        className="border-emerald-400/80"
        onChange={(e) => {
          setText(e.target.value)
          // Set a default filename based on the text content
          setFilename(filename)
        }}
        rows={17}
        cols={50}
      />{" "}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary" size="sm" className="">
            Clear
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex w-full gap-2">
        {/* LocalStorage stuff */}
        <div className="flex w-1/2 flex-row gap-2">
          <Button
            onClick={handleSaveToLocalStorage}
            disabled={!text.length > 0}
          >
            Save to local storage
          </Button>

          <Button onClick={handleLoadFromLocalStorage}>
            Load from local storage
          </Button>
        </div>

        <div className="flex w-1/2 flex-row gap-2">
          <Input
            className="w-[69%]"
            type="text"
            placeholder="filename"
            value={filename}
            required
            onChange={(e) => setFilename(e.target.value)}
          />
          <Button
            className="w-[31%]"
            disabled={!text.length > 0 || !filename.length > 0}
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      </div>
      <div className="flex w-full justify-end">
        {storageUsed !== null ? (
          <span>~{100 - storageUsed}% of localstorage storage left</span>
        ) : (
          <Loader2 className="size-5 w-[36%] animate-spin" />
        )}
      </div>
    </div>
  )
}
