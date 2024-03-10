"use server"

import { headers } from "next/headers"
import { NextResponse } from "next/server"
import MemoryCache from "memory-cache"

import { PutObjectCommand, s3Client } from "../lib/s3"

function getCurrentShorthandDateTime() {
  const currentDate = new Date()
  const day = currentDate.getDate()
  const month = currentDate.getMonth() + 1 // Months are zero-based
  const year = currentDate.getFullYear()
  const hours = currentDate.getHours()
  const minutes = currentDate.getMinutes()
  const seconds = currentDate.getSeconds()

  // Pad single-digit day, month, hours, minutes, and seconds with leading zeros
  const paddedDay = day < 10 ? `0${day}` : day
  const paddedMonth = month < 10 ? `0${month}` : month
  const paddedHours = hours < 10 ? `0${hours}` : hours
  const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes

  // Format the date and time as YYYY-MM-DD HH:MM:SS
  const shorthandDateTime = `${year}-${paddedMonth}-${paddedDay} ${paddedHours}:${paddedMinutes}`

  return shorthandDateTime
}

export const putObjectInS3Bucket = async (formData) => {
  const forwardedFor = headers().get("x-forwarded-for")
  const ip = forwardedFor ? forwardedFor.split(",")[0] : null // Extract first IP

  if (!ip) {
    console.warn("Client IP address not found")
    // Handle cases where IP is missing (e.g., reject request or implement alternative rate limiting)
    return res.status(400).json({ message: "Client IP address not found" })
  }

  const now = Date.now()
  const cacheKey = `rateLimit-${ip}`

  // Check if the request is within the rate limit window
  const lastSubmission = MemoryCache.get(cacheKey)
  if (lastSubmission && now - lastSubmission < 60000) {
    console.log({
      message: "Limit exceeded, please try again later",
      timeRemaining: Math.ceil((60000 - (now - lastSubmission)) / 1000), // Optional: Display remaining time
    })
    return
  }

  // Rate limit not exceeded, proceed with server action logic
  const name = formData.get("name")
  const message = formData.get("feedback")
  const date = getCurrentShorthandDateTime()
  try {
    const jsonData = JSON.stringify({ date, message })
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `feedback/${name}-${date}.json`,
      Body: jsonData,
    }

    const res = await s3Client.send(new PutObjectCommand(params))
    console.log(res)
  } catch (error) {
    console.log(error)
  }

  // Update last submission time in the cache
  MemoryCache.put(cacheKey, now, 60000) // Cache for 1 minute
}
