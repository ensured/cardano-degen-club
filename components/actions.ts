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

import { db, deleteObject, storage } from "./firebase/firebase"

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

export async function getFavoritesFirebase(userEmail: string) {
  const folderRef = storageRef(storage, `images/${userEmail}/`);
  const results = await listAll(folderRef);
  const items: { name: string; url: string; link: string }[] = [];

  // Temporary array to store items along with timeCreated for sorting purposes
  const itemsWithTimeCreated: { name: string; url: string; link: string; timeCreated: string }[] = [];

  // Use Promise.all with map to wait for all download URLs and metadata
  await Promise.all(
    results.items.map(async (itemRef) => {
      try {
        const downloadUrl = await getDownloadURL(itemRef); // Get the download URL of the file
        const metadata = await getMetadata(itemRef); // Get the metadata of the file

        itemsWithTimeCreated.push({
          link: metadata?.customMetadata?.link ?? "",
          name: metadata?.customMetadata?.name ?? "",
          url: downloadUrl,
          timeCreated: metadata.timeCreated, // Add the timeCreated for sorting
        });
      } catch (error) {
        console.error("Error fetching download URL or metadata:", error);
      }
    })
  );

  // Sort items by timeCreated in descending order (most recent first)
  itemsWithTimeCreated.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());

  // Push only the name, url, and link fields (without timeCreated) to the final items array
  itemsWithTimeCreated.forEach(({ name, url, link }) => {
    items.push({ name, url, link });
  });

  return items; // Return the items array without timeCreated
}




export async function deleteAllFavoritesFirebase() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated, please login" }
  }
  const userEmail = user.email

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
  if (!user) {
    return { error: "Not authenticated, please login" }
  }
  const userEmail = user.email

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
  console.log(extractRecipeId(link))
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated, please login" }
  }
  const userEmail = user.email

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
