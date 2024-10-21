"use server"

import { revalidatePath } from "next/cache"
import { checkRateLimit, getClientIp } from "@/utils/rateLimiter"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { doc, getDoc, setDoc } from "firebase/firestore"
import {
  getDownloadURL,
  getMetadata,
  listAll,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage"
import { z } from "zod"

import { FeedbackFormSchema } from "@/lib/schema"

import { PutObjectCommand, s3Client } from "../lib/s3"
import { db, deleteObject, storage } from "./firebase/firebase"

type Inputs = z.infer<typeof FeedbackFormSchema>

export const imgUrlToBase64 = async (url: string) => {
  try {
    const response = await fetch(url)
    const imageBuffer = await response.arrayBuffer() // Use arrayBuffer instead of buffer
    const imageBase64 = Buffer.from(imageBuffer).toString("base64") // Convert buffer to Base64
    return `data:image/jpeg;base64,${imageBase64}` // Return the Base64 image data
  } catch (error) {
    console.error("Error downloading image:", error)
    return null
  }
}

export async function submitFeedback(data: Inputs) {
  const result = FeedbackFormSchema.safeParse(data)

  if (!result.success) {
    return { success: false, message: "Invalid form submission." }
  }

  const ip = getClientIp()
  if (!ip) {
    console.warn("Client IP address not found.")
    return { success: false, message: "Client IP address not found." }
  }

  // Apply rate-limiting
  const rateLimitResult = await checkRateLimit("feedback", ip, 120000)
  if (!rateLimitResult.success) {
    return rateLimitResult // Return rate limit failure
  }

  try {
    const date = new Date().toISOString()
    const jsonData = JSON.stringify({ date, ...data })

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `feedback/${data.name}-${date}.json`,
      Body: jsonData,
    }

    await s3Client.send(new PutObjectCommand(params))
    revalidatePath("/protected")

    return { success: true, message: "Thanks for your feedback! 🙏" }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    }
  }
}

export async function getFavoritesFirebase(userEmail: string) {
  const folderRef = storageRef(storage, `images/${userEmail}/`)
  const results = await listAll(folderRef)
  const items: { name: string; link: string; url: string; metadata: any }[] = []

  // Use Promise.all with map to wait for all download URLs and metadata
  await Promise.all(
    results.items.map(async (itemRef) => {
      try {
        const downloadUrl = await getDownloadURL(itemRef) // Get the download URL of the file
        const metadata = await getMetadata(itemRef) // Get the metadata of the file

        items.push({
          name: itemRef.name,
          link: itemRef.fullPath,
          url: downloadUrl,
          metadata: metadata.customMetadata, // Access customMetadata
        })
      } catch (error) {
        console.error("Error fetching download URL or metadata:", error)
      }
    })
  )

  return items // Return the populated items array
}

export async function deleteAllFavoritesFirebase() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  const userEmail = user?.email
  if (!userEmail) {
    return { error: "Not authenticated, please login" }
  }

  const userFolderRef = storageRef(storage, `images/${userEmail}/`)

  try {
    // List all items in the user's folder
    const result = await listAll(userFolderRef)
    const itemsCount = result.items.length

    // Loop through all files and delete them
    const deletePromises = result.items.map((fileRef) => {
      return deleteObject(fileRef)
    })

    // Wait for all delete operations to complete
    await Promise.all(deletePromises)

    // Call function to reset image count
    await handleSetMaxImagesCount(true, userEmail)

    // Return an object with total items deleted
    return { total: itemsCount } // << Change here: return an object
  } catch (err) {
    console.error("Error deleting all favorites:", err)
    await handleSetMaxImagesCount(false, userEmail)
    return { error: "Failed to delete all favorites." }
  }
}

function extractRecipeId(url: string) {
  const startIndex = url.indexOf("recipe/") + "recipe/".length
  const endIndex = url.indexOf("/", startIndex)
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Invalid URL format")
  }
  return url.substring(startIndex, endIndex)
}

export async function removeFavoriteFirebase(
  recipeName: string,
  needFormatting: boolean = true
) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  const userEmail = user?.email
  if (!userEmail) {
    return { error: "Not authenticated, please login" }
  }

  let key
  if (needFormatting) {
    key = `images/${userEmail}/${extractRecipeId(recipeName)}`
  } else {
    key = `images/${userEmail}/${recipeName}`
  }

  // Create a reference to the file to delete
  const imageRef = storageRef(storage, key)

  try {
    // Delete the image from Firebase Storage
    await deleteObject(imageRef)
    await handleSetMaxImagesCount(false, userEmail)
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting image:", error)
    return {
      success: false,
      error: "Failed to delete image from Firebase Storage",
    }
  }
}

const handleSetMaxImagesCount = async (
  delAll: boolean = false,
  userEmail: string
) => {
  // user is already authenticated
  const userDocRef = doc(db, "users", userEmail) // Firestore reference

  // Get the current image count from Firestore
  const userDoc = await getDoc(userDocRef)
  const currentImageCount = userDoc.exists() ? userDoc.data().imageCount : 0

  if (delAll) {
    await setDoc(userDocRef, { imageCount: 0 }, { merge: true })
    return
  }

  // Check if the user has reached the limit
  if (currentImageCount >= 100) {
    return {
      error: "Maximum limit of 100 favorites reached. Remove some to add more.",
    }
  }
  // Update the image count in Firestore
  await setDoc(
    userDocRef,
    { imageCount: currentImageCount + 1 },
    { merge: true }
  )
}

// @ts-ignore
const addToFavoritesFirebase = async ({ name, url, link, metadata }) => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  const userEmail = user?.email
  if (!userEmail) {
    return { error: "Not authenticated, please login" }
  }

  try {
    // Proceed with the upload
    const imageResponse = await fetch(url)
    const imageBlob = await imageResponse.blob()

    const imageRef = storageRef(
      storage,
      `images/${userEmail}/${extractRecipeId(link)}`
    )

    const uploadResult = await uploadBytes(imageRef, imageBlob, metadata)
    const downloadUrl = await getDownloadURL(uploadResult.ref)
    await handleSetMaxImagesCount(false, userEmail)

    return {
      url: downloadUrl, // The actual URL of the uploaded image
    }
  } catch (err) {
    console.error("Error adding favorite:", err)
    return { error: "Failed to add favorite." }
  }
}

export { addToFavoritesFirebase }
