"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadImage } from "@/components/firebase/hooks"

import { fileToBase64 } from "../../utils/helper"

// Import server action

const Page = () => {
  const [file, setFile] = useState(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getKindeSession = async () => {
      const res = await fetch("/api/auth/kindeSession")
      const data = await res.json()
      setUser(data.user)
    }

    getKindeSession()
  }, [])

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setUploadedImageUrl(null)
  }

  // Handle image upload (pass base64 to server action)
  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file")
      return
    }

    setLoading(true)
    setUploadError(null)

    try {
      // Convert the file to base64
      const base64File = await fileToBase64(file)
      const metadata = {
        contentType: file.type,
        customMetadata: { title: "enter title here", url: "enter url here" },
        cacheControl: "public,max-age=300",
      }
      // Pass the base64 file to the server action
      const uploadedUrl = await uploadImage(base64File, file.name, metadata) // Call server action with base64 and file name
      if (uploadedUrl.error) {
        toast(`${uploadedUrl.error}`, {
          type: "error",
        })
        return
      }
      setUploadedImageUrl(uploadedUrl) // Save the uploaded image URL
    } catch (error) {
      console.error(error)
      setUploadError("Error uploading image")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gap- flex w-full flex-col items-center justify-center p-6">
      {user ? (
        <>
          <h1 className="text-xl">Welcome back {user.given_name}!</h1>
          <h2 className="mb-4 text-xl font-semibold">
            Select and Upload an Image
          </h2>
          <div className="mb-4">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading..." : "Upload Image"}
          </Button>
          <div
            id="preview image"
            className="
              relative mx-auto flex max-w-[22rem] flex-col items-center justify-center overflow-hidden rounded-md bg-white shadow-lg dark:bg-gray-800"
          >
            {file && !uploadedImageUrl ? (
              <Image
                src={file ? URL.createObjectURL(file) : ""}
                alt="Selected"
                id="image"
                className="size-auto rounded-sm"
                width={350}
                height={350}
              />
            ) : null}

            {uploadError && <p className="mt-2 text-red-500">{uploadError}</p>}
          </div>
          {uploadedImageUrl && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Uploaded Image:</h2>
              <Image
                src={uploadedImageUrl}
                alt="Uploaded"
                className="mt-2"
                width={500}
                height={500}
              />
            </div>
          )}
        </>
      ) : (
        <Loader2 className="size-20 animate-spin" />
      )}
    </div>
  )
}

export default Page
