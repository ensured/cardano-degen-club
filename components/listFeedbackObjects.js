"use server"

import { ListObjectsV2Command, s3Client } from "../lib/s3"

export default async function listFeedbackObjects() {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: "feedback/",
    }

    const response = await s3Client.send(new ListObjectsV2Command(params))
    const feedbackObjects = response.Contents

    return { success: true, feedbackObjects }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Error listing feedback objects" }
  }
}
