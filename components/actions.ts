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
  recipeName: string
  recipeImage: string
}

export async function getFavoriteImages() {
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
    const keys = listObjectsV2Response.Contents?.map((object) => object.Key)

    if (!keys || keys.length === 0) {
      return [] // No objects found, return empty array
    }

    // Generate pre-signed URLs for all keys in parallel
    const preSignedUrls = await Promise.all(
      keys.map(async (key) => {
        try {
          if (!key) return null
          const preSignedUrl = await generatePreSignedUrl(key)
          return preSignedUrl
        } catch (error) {
          console.error(
            `Error generating pre-signed URL for key ${key}:`,
            error
          )
          return null // Return null for failed URLs
        }
      })
    )

    const validUrls = preSignedUrls.filter((url) => url !== null)
    const fileNames = keys.map((key) =>
      key?.split("/").pop()?.replace(".jpg", "")
    )

    const keyUrlPairs = [
      ...fileNames.map((fileName, index) => ({
        recipeName: fileName,
        url: validUrls[index],
      })),
    ]

    return keyUrlPairs
  } catch (error) {
    console.error("Error fetching favorite images:", error)
    return [] // Return empty array in case of error
  }
}

export async function deleteAllFavorites() {
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

    const keys = listObjectsV2Response.Contents?.map((object) => object.Key)
    console.log(keys)
    if (!keys || keys.length === 0) {
      return [] // No objects found, return empty array
    }
    const objectsToDelete = keys.map((key) => ({ Key: key }))

    const deleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME_RECIPES,
      Delete: { Objects: objectsToDelete },
    })

    const deleteObjectsResponse = await s3Client.send(deleteObjectsCommand)
    return deleteObjectsResponse
  } catch (err) {
    console.error("Error fetching favorite images:", err)
    return [] // Return empty array in case of error
  }
}

export async function addFavorite({ recipeName, recipeImage }: Favorite) {
  const { getUser, isAuthenticated } = getKindeServerSession()
  if (!isAuthenticated()) return
  const userEmail = await getUser().then((user) => user?.email)
  const imageResponse = await fetch(recipeImage)
  const imageBlob = await imageResponse.blob()
  const key = `favorites/images/${userEmail}/${recipeName}.jpg`

  const params = {
    Bucket: process.env.S3_BUCKET_NAME_RECIPES,
    Key: key,
    Body: Buffer.from(await imageBlob.arrayBuffer()),
  }

  const putObjectCommand = new PutObjectCommand(params)
  const putObjectResponse = await s3Client.send(putObjectCommand)
  // console.log(putObjectResponse)

  const preSignedImageUrl = await generatePreSignedUrl(key)
  return { preSignedImageUrl }
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
