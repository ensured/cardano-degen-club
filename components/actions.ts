"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import MemoryCache from "memory-cache"
import { z } from "zod"

import { FeedbackFormSchema } from "@/lib/schema"

import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  getSignedUrl,
  s3Client,
} from "../lib/s3"

type Inputs = z.infer<typeof FeedbackFormSchema>

const FEEDBACK_FORM_TIMEOUT_MS = 300000
function getCurrentShorthandDateTime() {
  const currentDate = new Date()
  const padded = (value: any) => (value < 10 ? `0${value}` : value)

  return `${currentDate.getFullYear()}-${padded(
    currentDate.getMonth() + 1
  )}-${padded(currentDate.getDate())} ${padded(
    currentDate.getHours()
  )}:${padded(currentDate.getMinutes())}:${padded(currentDate.getSeconds())}`
}

async function generatePreSignedUrl(key: string) {
  const expiresIn = 3600 // Expires in 1 hour (adjust as needed)

  const preSignedUrlParams = {
    Bucket: process.env.S3_BUCKET_NAME_RECIPES,
    Key: key,
    Expires: expiresIn,
  }

  try {
    const getPreSignedUrlCommand = new GetObjectCommand(preSignedUrlParams)
    const preSignedImageUrl = await getSignedUrl(
      s3Client,
      getPreSignedUrlCommand,
      {
        expiresIn: expiresIn,
      }
    )
    return preSignedImageUrl
  } catch (error) {
    console.error("Error generating pre-signed URL:", error)
    // Handle error gracefully
    return null
  }
}
export async function submitFeedback(data: Inputs) {
  const result = FeedbackFormSchema.safeParse(data)

  if (!result) {
    return {
      success: false,
      message: `Something went wrong when submitting your feedback`,
    }
  }

  if (result.success) {
    const forwardedFor = headers().get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(",")[0] : null

    if (!ip) {
      console.warn("Client IP address not found")
      // Handle cases where IP is missing (e.g., reject request or implement alternative rate limiting)
      return { success: false, message: "Client IP address not found" }
    }

    const now = Date.now()
    const cacheKey = `rateLimit-${ip}`

    // Check if the request is within the rate limit window
    const lastSubmission = MemoryCache.get(cacheKey)
    if (lastSubmission && now - lastSubmission < FEEDBACK_FORM_TIMEOUT_MS) {
      console.log({
        success: false,
        message: `Rate limit exceeded, please try again in ${Math.ceil(
          (FEEDBACK_FORM_TIMEOUT_MS - (now - lastSubmission)) / 1000
        )} seconds`,
      })
      return {
        success: false,
        message: `Rate limit exceeded, please try again in ${Math.ceil(
          (FEEDBACK_FORM_TIMEOUT_MS - (now - lastSubmission)) / 1000
        )} seconds`,
      }
    }

    const date = getCurrentShorthandDateTime()
    try {
      const jsonData = JSON.stringify({
        date,
        name: data.name,
        feedback: data.feedback,
      })
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `feedback/${data.name}-${date}.json`,
        Body: jsonData,
      }
      const res = await s3Client.send(new PutObjectCommand(params))
      revalidatePath("/protected")
      return {
        success: true,
        message: `Feedback submitted successfully! status: ${res.$metadata.httpStatusCode}`,
      }
    } catch (error) {
      console.error(error)
      return {
        success: false,
        message: "An error occurred. Please try again later.",
      }
    } finally {
      // Update last submission time in the cache
      MemoryCache.put(cacheKey, now, FEEDBACK_FORM_TIMEOUT_MS) // Cache for 1 minute
    }
  } else {
    return {
      success: false,
      message: result.error.errors[0].message,
    }
  }
}

type Favorite = {
  name: string
  url: string
  link: string
}

export async function getFavorites() {
  const { getUser, isAuthenticated } = getKindeServerSession()
  if (!isAuthenticated()) return

  const userEmail = await getUser().then((user) => user?.email)
  const params = {
    Bucket: process.env.S3_BUCKET_NAME_RECIPES,
    Prefix: `favorites/images/${userEmail}/`,
  }

  try {
    const listObjectsV2Command = new ListObjectsV2Command(params)
    const listObjectsV2Response = await s3Client.send(listObjectsV2Command)
    const objects = listObjectsV2Response.Contents || []

    if (objects.length === 0) {
      return [] // No objects found, return empty array
    }

    // Fetch metadata and generate pre-signed URLs for all objects in parallel
    const metadataAndUrls = await Promise.all(
      objects.map(async (object) => {
        const key = object.Key
        if (!key) return
        try {
          const headObjectCommand = new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME_RECIPES,
            Key: key,
          })
          const headObjectResponse = await s3Client.send(headObjectCommand)

          // Extract metadata
          const metadata = headObjectResponse.Metadata
          const name = metadata?.name
          const link = metadata?.link

          // Generate pre-signed URL
          const preSignedUrl = await generatePreSignedUrl(key)

          return { name, link, url: preSignedUrl }
        } catch (error) {
          console.error(`Error fetching metadata for key ${key}:`, error)
          return null // Return null for failed metadata retrieval
        }
      })
    )

    // Filter out null entries (failed metadata retrieval)
    const validMetadataAndUrls = metadataAndUrls.filter(
      (entry) => entry !== null
    )

    return validMetadataAndUrls
  } catch (error) {
    console.error("Error fetching favorite images:", error)
    return [] // Return empty array in case of error
  }
}

export async function deleteAllFavorites() {
  const { getUser, isAuthenticated } = getKindeServerSession()
  if (!isAuthenticated()) throw new Error("User not authenticated")

  const userEmail = await getUser().then((user) => user?.email)
  if (!userEmail) throw new Error("User email not found")

  const params = {
    Bucket: process.env.S3_BUCKET_NAME_RECIPES,
    Prefix: `favorites/images/${userEmail}/`,
  }

  try {
    const listObjectsV2Command = new ListObjectsV2Command(params)
    const listObjectsV2Response = await s3Client.send(listObjectsV2Command)

    const keys = listObjectsV2Response.Contents?.map((object) => object.Key)
    if (!keys || keys.length === 0) {
      return { Deleted: [] } // No objects found, return empty array
    }

    const objectsToDelete = keys.map((key) => ({ Key: key }))

    const deleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME_RECIPES,
      Delete: { Objects: objectsToDelete },
    })

    const deleteObjectsResponse = await s3Client.send(deleteObjectsCommand)
    return deleteObjectsResponse
  } catch (err) {
    console.error("Error deleting favorite images:", err)
    throw new Error("Failed to delete favorite images")
  }
}

export async function addFavorite({ name, url, link }: Favorite) {
  const { getUser, isAuthenticated } = getKindeServerSession()
  if (!isAuthenticated()) return

  const userEmail = await getUser().then((user) => user?.email)

  if (!userEmail) {
    return { error: "User email not found" }
  }

  try {
    // Check the total number of images in the favorites folder
    const listObjectsV2Command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME_RECIPES,
      Prefix: `favorites/images/${userEmail}/`,
    })
    const listObjectsV2Response = await s3Client.send(listObjectsV2Command)
    const totalImages = listObjectsV2Response.Contents?.length || 0
    if (totalImages >= 100) {
      return {
        error:
          "Maximum limit of 100 favorites reached. Remove some to add more",
      }
    }

    // Fetch the image and upload it
    const imageResponse = await fetch(url)
    const imageBlob = await imageResponse.blob()
    const key = `favorites/images/${userEmail}/${name}.jpg`

    const params = {
      Bucket: process.env.S3_BUCKET_NAME_RECIPES,
      Key: key,
      Body: Buffer.from(await imageBlob.arrayBuffer()),
      Metadata: {
        email: userEmail,
        name: name,
        link: link,
      },
    }

    const putObjectCommand = new PutObjectCommand(params)
    const putObjectResponse = await s3Client.send(putObjectCommand)

    // Generate pre-signed URL for the uploaded image
    const preSignedImageUrl = await generatePreSignedUrl(key)

    return { preSignedImageUrl }
  } catch (err) {
    console.error("Error adding favorite:", err)
    return { error: "Failed to add favorite." }
  }
}

export async function removeFavorite(recipeName: string) {
  const { getUser, isAuthenticated } = getKindeServerSession()
  if (!isAuthenticated()) return
  const userEmail = await getUser().then((user) => user?.email)
  const key = `favorites/images/${userEmail}/${recipeName}.jpg`
  const params = {
    Bucket: process.env.S3_BUCKET_NAME_RECIPES,
    Key: key,
  }
  const deleteObjectCommand = new DeleteObjectCommand(params)
  const deleteObjectResponse = await s3Client.send(deleteObjectCommand)
  return
}

export async function getPreSignedUrl(key: string) {
  return await generatePreSignedUrl(key)
}

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
