'use server'

import { MAX_FAVORITES } from '@/utils/consts'
import { extractRecipeId } from '@/utils/helper'
import { currentUser } from '@clerk/nextjs/server'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDownloadURL, getMetadata, listAll, ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, deleteObject, storage } from '../components/firebase/firebase'
import { kv } from '@vercel/kv'

export async function checkUserAuthentication() {
	const user = await currentUser()
	if (!user) return
	return user?.emailAddresses[0].emailAddress
}

// @ts-ignore
export async function removeItemsFirebase(keys) {
	const userEmail = await checkUserAuthentication()
	if (!userEmail) {
		return { error: 'User email is required' }
	}

	// remove all keys from firebase db
	await Promise.all(
		// @ts-ignore
		keys.map(async (key) => {
			try {
				// @ts-ignore
				const imageFileRef = storageRef(storage, `images/${userEmail}/${key}`)
				// @ts-ignore
				await deleteObject(imageFileRef)
			} catch (error) {
				console.error('Error deleting item from favorites:', error)
			}
		}),
	)

	await handleSetMaxImagesCount(false, userEmail, {
		decrement: true,
		amount: keys.length,
	})
}

// // @ts-ignore
// export async function addToFavoritesFirebase({ name, url, link, metadata }) {
//   const userEmail = await checkUserAuthentication()
//   if (!userEmail) {
//     return { error: "User email is required" }
//   }

//   try {
//     // Proceed with the upload after user authentication
//     const imageResponse = await fetch(url)

//     // Check if the image response is ok (status 200-299)
//     if (!imageResponse.ok) {
//       return { error: "Failed to fetch the image." }
//     }

//     const imageBlob = await imageResponse.blob()

//     const imageRef = storageRef(
//       storage,
//       `images/${userEmail}/${extractRecipeId(link)}`
//     )

//     const uploadResult = await uploadBytes(imageRef, imageBlob, metadata)
//     const downloadUrl = await getDownloadURL(uploadResult.ref)

//     // Call to handle max image count, checking for errors
//     const res = await handleSetMaxImagesCount(false, userEmail, {
//       increment: true,
//     })

//     if (res?.error) {
//       // Optionally delete the uploaded image if max count exceeded
//       await deleteObject(imageRef) // Uncomment if you want to delete the uploaded image

//       return {
//         error: res.error,
//       }
//     }

//     return {
//       url: downloadUrl, // The actual URL of the uploaded image
//     }
//   } catch (err) {
//     console.error("Error adding favorite:", err)
//     return { error: "Failed to add favorite." }
//   }
// }

export async function getFavoritesFirebase(userEmail: string) {
	const folderRef = storageRef(storage, `images/${userEmail}/`)
	const results = await listAll(folderRef)

	// Create an object to hold the favorite items
	const favorites: {
		[key: string]: { name: string; url: string; link: string }
	} = {}

	// Temporary array to store items along with timeCreated for sorting purposes
	const itemsWithTimeCreated: {
		name: string
		url: string
		link: string
		timeCreated: string
	}[] = []

	// Use Promise.all with map to wait for all download URLs and metadata
	await Promise.all(
		results.items.map(async (itemRef) => {
			try {
				const downloadUrl = await getDownloadURL(itemRef) // Get the download URL of the file
				const metadata = await getMetadata(itemRef) // Get the metadata of the file

				itemsWithTimeCreated.push({
					link: metadata?.customMetadata?.link ?? '',
					name: metadata?.customMetadata?.name ?? '',
					url: downloadUrl,
					timeCreated: metadata.timeCreated, // Add the timeCreated for sorting
				})
			} catch (error) {
				console.error('Error fetching download URL or metadata:', error)
			}
		}),
	)

	// Sort items by timeCreated in ascending order (oldest first)
	itemsWithTimeCreated.sort((a, b) => new Date(a.timeCreated).getTime() - new Date(b.timeCreated).getTime())

	// Build the favorites object
	itemsWithTimeCreated.forEach(({ name, url, link }) => {
		// Use the link as the key and create an object for the value
		favorites[link] = { name, url, link }
	})

	return favorites // Return the favorites object
}

export async function deleteAllFavoritesFirebase() {
	const userEmail = await checkUserAuthentication()
	if (!userEmail) {
		return { error: 'User email is required' }
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
		console.error('Error deleting all favorites:', err)
		return { error: 'Failed to delete all favorites.' }
	}
}

export async function removeFavoriteFirebase(recipeName: string, needFormatting: boolean = true) {
	const userEmail = await checkUserAuthentication()
	if (!userEmail) {
		return { error: 'User email is required' }
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
		await handleSetMaxImagesCount(false, userEmail, { decrement: true })
		return {
			success: true,
		}
	} catch (error) {
		console.error('Error deleting image:', error)
		return {
			success: false,
			error: 'Failed to delete image, try again.',
		}
	}
}

interface SetMaxImagesCountOptions {
	increment?: boolean
	decrement?: boolean
	amount?: number
}

const handleSetMaxImagesCount = async (delAll: boolean, userEmail: string, options: SetMaxImagesCountOptions = {}) => {
	const { increment = false, decrement = false, amount = 1 } = options

	// Firestore reference to the user's document
	const userDocRef = doc(db, 'users', userEmail)

	if (delAll) {
		// If delAll is true, reset the image count to 0
		await setDoc(userDocRef, { imageCount: 0 }, { merge: true })
		return
	}

	// Get the current image count from Firestore
	const userDoc = await getDoc(userDocRef)
	const currentImageCount = userDoc.exists() ? userDoc.data().imageCount : 0

	// Handle increment logic
	if (increment) {
		if (currentImageCount >= MAX_FAVORITES) {
			return {
				error: `Maximum limit of ${MAX_FAVORITES} favorites reached. Remove some to add more.`,
			}
		}
		// Increment the image count by the specified amount
		await setDoc(
			userDocRef,
			{ imageCount: Math.min(currentImageCount + amount, MAX_FAVORITES) }, // Prevent going over MAX_FAVORITES
			{ merge: true },
		)
		return
	}

	// Handle decrement logic
	if (decrement) {
		if (currentImageCount === 0) {
			return {
				error: 'Cannot decrement. The image count is already at 0.',
			}
		}
		// Decrement the image count by the specified amount, ensuring it doesn't go below 0
		await setDoc(userDocRef, { imageCount: Math.max(currentImageCount - amount, 0) }, { merge: true })
		return
	}

	// Error handling for both increment and decrement being true
	if (increment && decrement) {
		console.error('Both increment and decrement cannot be true at the same time.')
		return {
			error: 'Both increment and decrement cannot be true at the same time.',
		}
	}
}

// Add this new server action
export async function addItemsFirebase(
	userEmail: string,
	items: Array<{
		name: string
		url: string
		link: string
		metadata: any
	}>,
) {
	if (!userEmail) {
		return { error: 'User email is required' }
	}

	try {
		// Get current favorites count
		const userDocRef = doc(db, 'users', userEmail)
		const userDoc = await getDoc(userDocRef)
		const currentImageCount = userDoc.exists() ? userDoc.data().imageCount : 0

		// Calculate how many items we can actually add
		const remainingSlots = MAX_FAVORITES - currentImageCount
		if (remainingSlots <= 0) {
			return {
				error: `Maximum limit of ${MAX_FAVORITES} favorites reached.`,
				results: items.map((item) => ({
					success: false,
					link: item.link,
					error: 'Maximum favorites limit reached',
				})),
			}
		}

		// Only process items that fit within the limit
		const itemsToProcess = items.slice(0, remainingSlots)

		// Fetch all images in parallel
		const imagePromises = itemsToProcess.map(async ({ url }) => {
			const response = await fetch(url)
			if (!response.ok) throw new Error('Failed to fetch image')
			return response.blob()
		})

		// Wait for all image fetches to complete
		const imageBlobs = await Promise.all(imagePromises)

		// Process uploads in batches of 5 to avoid overwhelming the server
		const batchSize = 5
		const results = []

		for (let i = 0; i < itemsToProcess.length; i += batchSize) {
			const batch = itemsToProcess.slice(i, i + batchSize)
			const batchBlobs = imageBlobs.slice(i, i + batchSize)

			const batchPromises = batch.map(async ({ name, link, metadata }, index) => {
				try {
					const imageRef = storageRef(storage, `images/${userEmail}/${extractRecipeId(link)}`)

					const uploadResult = await uploadBytes(imageRef, batchBlobs[index], metadata)
					const downloadUrl = await getDownloadURL(uploadResult.ref)

					return {
						success: true,
						link,
						url: downloadUrl,
						name,
					}
				} catch (error) {
					return {
						success: false,
						link,
						error: 'Failed to upload image',
					}
				}
			})

			const batchResults = await Promise.all(batchPromises)
			results.push(...batchResults)
		}

		// Add failed results for items that weren't processed due to limit
		const allResults = [
			...results,
			...items.slice(remainingSlots).map((item) => ({
				success: false,
				link: item.link,
				error: 'Exceeded maximum favorites limit',
			})),
		]

		// Update the image count in a single operation
		const successfulUploads = results.filter((r) => r.success).length
		if (successfulUploads > 0) {
			await setDoc(userDocRef, { imageCount: currentImageCount + successfulUploads }, { merge: true })
		}

		return {
			results: allResults,
			successCount: successfulUploads,
			partialSuccess: itemsToProcess.length < items.length,
			message:
				itemsToProcess.length < items.length
					? `Only ${successfulUploads} items were added due to favorites limit`
					: undefined,
		}
	} catch (error) {
		console.error('Error in batch upload:', error)
		return {
			error: 'Failed to process batch upload',
			results: items.map((item) => ({
				success: false,
				link: item.link,
				error: 'Batch upload failed',
			})),
		}
	}
}

// Modify the getImagesBase64 function to report progress
export async function getImagesBase64(urls: string[]) {
	try {
		// Process all images in parallel
		const imagePromises = urls.map(async (url) => {
			try {
				const response = await fetch(url, {
					headers: {
						Accept: 'image/webp,image/jpeg,image/png,image/*',
					},
					cache: 'force-cache',
				})

				if (!response.ok) {
					return [url, null]
				}

				const contentType = response.headers.get('content-type') || 'image/jpeg'
				const buffer = await response.arrayBuffer()
				const base64 = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`

				return [url, base64]
			} catch (error) {
				console.error('Error processing image:', url, error)
				return [url, null]
			}
		})

		// Wait for all images to be processed
		const results = await Promise.all(imagePromises)

		// Convert results array to object, filtering out failed images
		return Object.fromEntries(results.filter(([_, base64]) => base64 !== null))
	} catch (error) {
		console.error('Error in batch image processing:', error)
		return {}
	}
}

export async function getEpochData() {
	const blockfrostApiKey = process.env.BLOCKFROST_API_KEY
	if (!blockfrostApiKey) {
		return { error: 'Blockfrost API key not found' }
	}
	const url = `https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest`
	const response = await fetch(url, {
		headers: {
			project_id: blockfrostApiKey,
		},
		next: {
			revalidate: 0,
		},
	})
	const data = await response.json()
	return data
}

const cache: { [key: string]: { data: any; timestamp: number } } = {}
const RATE_LIMIT = 3 // Maximum number of requests allowed
const RATE_LIMIT_WINDOW_MS = 12000 // Time window in milliseconds (20 seconds)
let requestCount = 0 // Counter for requests
let firstRequestTime: number | null = null // Timestamp of the first request in the current window

export const getAddressFromHandle = async (handleName: string) => {
	let error = null

	// Check if the handleName starts with $
	if (handleName.startsWith('$')) {
		handleName = handleName.slice(1)
	}
	const lowerCaseHandleName = handleName.toLowerCase()

	// Check cache first
	if (cache[lowerCaseHandleName]) {
		const cachedData = cache[lowerCaseHandleName]
		// Return cached data if it's still valid
		return cachedData.data
	}

	// Rate limiting logic
	const now = Date.now()
	if (firstRequestTime === null || now - firstRequestTime > RATE_LIMIT_WINDOW_MS) {
		// Reset the counter and timestamp if the time window has passed
		firstRequestTime = now
		requestCount = 0
	}

	if (requestCount >= RATE_LIMIT) {
		// Calculate time left until the next request can be made
		const timeLeft = RATE_LIMIT_WINDOW_MS - (now - firstRequestTime)
		return {
			error: `Rate limit exceeded. Please try again in ${Math.ceil(timeLeft / 1000)} seconds.`,
		}
	}

	// Increment the request count
	requestCount++

	const url = `https://api.handle.me/handles/${lowerCaseHandleName}`
	const response = await fetch(url, {
		headers: {
			accept: 'application/json',
		},
		next: {
			revalidate: 120,
		},
	})

	// Check if the response indicates a rate limit error
	if (response.status === 429) {
		// Rate limit exceeded
		const retryAfter = response.headers.get('Retry-After') // Get the retry time from headers if available
		return {
			error: 'Rate limit exceeded. Please try again later.',
			timeLeft: retryAfter ? parseInt(retryAfter, 10) : null, // Return time left if provided
		}
	}

	const data = await response.json()

	if (data.error) {
		error = data.error
	}
	let stakeAddress, image, address
	try {
		stakeAddress = data.holder
		image = data.image
		address = data.resolved_addresses.ada
	} catch (error) {
		return { error: 'Error in getAddressFromHandle' }
	}

	const errors: string[] = []

	if (!stakeAddress) {
		errors.push('No stake address found')
	}

	if (!address) {
		errors.push('No address found')
	}

	if (!image) {
		errors.push('No image found')
	}

	// Check if there are any errors
	if (errors.length > 0) {
		return { error: 'error something went wrong' } // Return all error messages as a single string
	}

	// Cache the result
	cache[lowerCaseHandleName] = {
		data: { stakeAddress, image, address, error },
		timestamp: Date.now(),
	}

	return { stakeAddress, image, address, error }
}

interface WalletAuth {
	address: string
	timestamp: number
	signature: string
}

export const getAdaHandle = async (stakeAddress: string) => {
	const res = await fetch(`https://api.handle.me/holders/${stakeAddress}`, {
		headers: {
			accept: 'application/json',
		},
	})
	const data = await res.json()
	return data
}

export async function storeWalletAuth(
	address: string,
	signature: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const authData: WalletAuth = {
			address,
			timestamp: Date.now(),
			signature,
		}

		// Store in KV with 120-day expiration (10368000 seconds)
		await kv.set(`wallet:${address}`, authData)

		// Verify it was stored
		const stored = await getWalletAuth(address)

		if (!stored) {
			return { success: false, error: 'Failed to verify storage' }
		}

		return { success: true }
	} catch (error) {
		console.error('Error storing wallet auth:', error)
		return { success: false, error: 'Failed to store wallet authentication' }
	}
}

export const getWalletAuth = async (address: string) => {
	const walletAuth = await kv.get(`wallet:${address}`)
	return walletAuth
}

export const removeWalletAuth = async (address: string) => {
	await kv.del(`wallet:${address}`)
}

export async function verifyWalletAuth(address: string): Promise<{ isValid: boolean; error?: string }> {
	try {
		const walletAuth = await getWalletAuth(address)

		if (!walletAuth) {
			return { isValid: false, error: 'No authentication found' }
		}

		// KV already returns the parsed object
		const auth = walletAuth as WalletAuth
		const currentTime = Date.now()
		const OneTwentyDays = 120 * 24 * 60 * 60 * 1000
		const timeDiff = currentTime - auth.timestamp

		// Simple existence check first
		if (auth.address === address) {
			return { isValid: true }
		}

		await kv.del(`wallet:${address}`)
		return { isValid: false, error: 'Invalid authentication' }
	} catch (error) {
		console.error('Error verifying wallet auth:', error)
		return { isValid: false, error: 'Failed to verify authentication' }
	}
}
