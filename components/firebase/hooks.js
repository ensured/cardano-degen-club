"use server"

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage"

import { storage } from "./firebase"

function getBase64FileSize(base64String) {
  const lengthInCharacters = base64String.length
  let numberOfPaddingCharacters = 0

  // Remove padding characters
  while (base64String.endsWith("=")) {
    base64String = base64String.slice(0, -1)
    numberOfPaddingCharacters++
  }

  const sizeInBytes = (lengthInCharacters * 3) / 4 - numberOfPaddingCharacters
  return sizeInBytes
}

// Function to upload an image and return its URL
export const uploadImage = async (base64File, fileName, metadata) => {
  // get the email of logged in user
  const { getUser } = getKindeServerSession()
  const userEmail = getUser().email
  if (!userEmail) {
    throw new Error("User not logged in")
  }
  const MAX_FILE_SIZE_B64 = 10 // (MB)
  if (getBase64FileSize(base64File) / 1000000 >= MAX_FILE_SIZE_B64) {
    return {
      error: `File size exceeds the limit. 
      ${(getBase64FileSize(base64File) / 1000000).toFixed(
        2
      )}/${MAX_FILE_SIZE_B64}(MB)`,
    }
  }

  const buffer = Buffer.from(base64File.split(",")[1], "base64") // Convert base64 to Buffer

  try {
    const imageRef = storageRef(storage, `images/${userEmail}/${fileName}`)

    // Upload the file using the buffer
    const uploadResult = await uploadBytes(imageRef, buffer, metadata)

    // Get the download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref)
    return downloadUrl // Return the URL to the client
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

export const deleteImage = async (imageRef) => {
  try {
    // Delete the image from storage
    await imageRef.delete()
    console.log("Image deleted successfully.")
  } catch (error) {
    console.error("Error deleting image:", error)
  }
}
