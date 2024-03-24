"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import MemoryCache from "memory-cache"
import { z } from "zod"

import { FormDataSchema, RecipeFetchUrlSchema } from "@/lib/schema"

import { PutObjectCommand, s3Client } from "../lib/s3"

type Inputs = z.infer<typeof FormDataSchema>

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

export async function submitFeedback(data: Inputs) {
  const result = FormDataSchema.safeParse(data)

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

export async function getRecipes(input: string) {
  const url = `https://api.edamam.com/api/recipes/v2?q=${input}&type=public&app_id=${process.env.APP_ID}&app_key=${process.env.APP_KEY}`
  const response = await fetch(url)
  const recipes = await response.json()
  console.log(recipes)
  return recipes
}

export async function getNextRecipe(nextUrl: string) {
  const response = await fetch(nextUrl)
  const recipes = await response.json()
  return recipes
}
