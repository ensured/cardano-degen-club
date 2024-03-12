"use server"

import { GetObjectCommand, s3Client } from "@/lib/s3"

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.on("end", () => resolve(Buffer.concat(chunks)))
    stream.on("error", (error) => reject(error))
  })
}

export default async function getFeedbackDataByKey(key) {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }

    const response = await s3Client.send(new GetObjectCommand(params))
    const feedbackDataBuffer = await streamToBuffer(response.Body)

    const feedbackData = JSON.parse(feedbackDataBuffer.toString())

    return { success: true, feedbackData }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Error getting feedback data" }
  }
}
