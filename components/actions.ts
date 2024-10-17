"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import MemoryCache from "memory-cache"
import { z } from "zod"
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types"
import { FeedbackFormSchema } from "@/lib/schema"
import pLimit from 'p-limit'
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
import { checkRateLimit, getClientIp } from "@/utils/rateLimiter"

const FEEDBACK_FORM_TIMEOUT_MS = 300000
type Inputs = z.infer<typeof FeedbackFormSchema>
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

type CustomUserProps = {
  // Add any additional properties you expect
  customProperty?: string; // example property
};

export async function submitFeedback(data: Inputs) {
  const result = FeedbackFormSchema.safeParse(data);

  if (!result.success) {
    return { success: false, message: "Invalid form submission." };
  }

  const ip = getClientIp();
  if (!ip) {
    console.warn("Client IP address not found.");
    return { success: false, message: "Client IP address not found." };
  }

  // Apply rate-limiting
  const rateLimitResult = await checkRateLimit("feedback",ip, 120000);
  if (!rateLimitResult.success) {
    return rateLimitResult; // Return rate limit failure
  }

  try {
    const date = new Date().toISOString();
    const jsonData = JSON.stringify({ date, ...data });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `feedback/${data.name}-${date}.json`,
      Body: jsonData,
    };

    await s3Client.send(new PutObjectCommand(params));
    revalidatePath("/protected");

    return { success: true, message: "Thanks for your feedback! 🙏" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "An error occurred. Please try again later." };
  }
}

type Favorite = {
  name: string
  url: string
  link: string
}



export async function getFavorites(userEmail: string) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME_RECIPES,
    Prefix: `favorites/images/${userEmail}/`,
  }

  try {
    const listObjectsV2Command = new ListObjectsV2Command(params)
    const listObjectsV2Response = await s3Client.send(listObjectsV2Command)
    const objects = (listObjectsV2Response.Contents || []).filter(obj => obj.Key)

    if (objects.length === 0) {
      return []
    }

    const limit = pLimit(5)
    const metadataAndUrls = await Promise.all(
      objects.map(object => limit(async () => {
        const key = object.Key
        if (!key) return
        try {
          const headObjectCommand = new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME_RECIPES,
            Key: key,
          })
          const headObjectResponse = await s3Client.send(headObjectCommand)
          const metadata = headObjectResponse.Metadata
          const name = metadata?.name
          const link = metadata?.link
          const preSignedUrl = await generatePreSignedUrl(key)

          return { name, link, url: preSignedUrl }
        } catch (error) {
          console.error(`Error fetching metadata for key ${key}:`, error)
          return null
        }
      }))
    )

    const validMetadataAndUrls = metadataAndUrls.filter(entry => entry !== null)
    return validMetadataAndUrls
  } catch (error) {
    console.error("Error fetching favorite images:", error)
    return []
  }
}


export async function deleteAllFavorites() {
  const { getUser, isAuthenticated } = getKindeServerSession()
  if (!isAuthenticated()) throw new Error("User not authenticated")

  const userEmail = await getUser().then((user: KindeUser<CustomUserProps> | null) => user?.email)
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

function extractRecipeId(url: string) {
  const startIndex = url.indexOf("recipe/") + "recipe/".length
  const endIndex = url.indexOf("/", startIndex)
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Invalid URL format")
  }
  return url.substring(startIndex, endIndex)
}

export async function addFavorite({ name, url, link }: Favorite) {
  const { getUser, isAuthenticated } = getKindeServerSession()
  if (!isAuthenticated()) return

  const userEmail = await getUser().then((user: KindeUser<CustomUserProps> | null) => user?.email)

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
    const key = `favorites/images/${userEmail}/${extractRecipeId(link)}.jpg`

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
  const userEmail = await getUser().then((user: KindeUser<CustomUserProps> | null) => user?.email)
  const key = `favorites/images/${userEmail}/${recipeName}.jpg`
  const params = {
    Bucket: process.env.S3_BUCKET_NAME_RECIPES,
    Key: key,
  }
  const deleteObjectCommand = new DeleteObjectCommand(params)
  const deleteObjectResponse = await s3Client.send(deleteObjectCommand)
  return deleteObjectResponse.$metadata
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