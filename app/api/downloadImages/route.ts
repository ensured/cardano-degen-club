import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import archiver from 'archiver'
import { Readable } from 'stream'
import * as cheerio from 'cheerio'
import { kv } from '@vercel/kv'

interface RateLimitInfo {
  remaining: number
  reset: number
  total: number
  downloadedCount?: number
  totalImages?: number
  remainingImages?: number
  partialDownload?: boolean
  awaitingDownload?: number
  hasAwaitingDownloads?: boolean
}

interface ImageInfo {
  url: string
  extension: string
}

interface UserDownloadInfo {
  count: number
  reset: number
  awaitingDownload: string[] // Array of image URLs waiting to be downloaded due to rate limits
}

const MAX_CHARACTERS = 1000000
const MAX_IMAGES = 1000
const RATE_LIMIT_DURATION = 3600000 // 1 hour

// Helper function to get user key from IP
const getUserKey = (ipAddress: string) => `imgDL:${ipAddress}`

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    const ipAddress = req.headers.get('x-forwarded-for')
    if (!ipAddress) {
      return NextResponse.json({ error: 'Unable to determine client IP' }, { status: 400 })
    }

    const userKey = getUserKey(ipAddress)

    // Handle reset action if requested
    if (action === 'reset') {
      // No password required - user can only reset their own data
      const now = Date.now()

      // Get current user info to preserve the count
      const currentUserInfo = (await kv.get(userKey)) as UserDownloadInfo | null

      await kv.set(userKey, {
        // Preserve the existing count to maintain rate limiting
        count: currentUserInfo?.count || 0,
        reset: currentUserInfo?.reset || now + RATE_LIMIT_DURATION,
        awaitingDownload: [], // Clear the awaiting download images array
      })

      return NextResponse.json({
        message: 'Download history reset successfully',
        remaining: Math.max(0, MAX_IMAGES - (currentUserInfo?.count || 0)),
        reset: currentUserInfo?.reset || now + RATE_LIMIT_DURATION,
        total: MAX_IMAGES,
        downloadedCount: 0,
        awaitingDownload: 0,
        hasAwaitingDownloads: false,
      })
    }

    // Debug endpoint to view current user data
    if (action === 'debug') {
      // No password required - user can only see their own data
      const userInfo = await kv.get(userKey)
      return NextResponse.json({
        userInfo,
        key: userKey,
        ip: ipAddress,
      })
    }

    // Normal rate limit info request
    const userInfo = (await kv.get(userKey)) as UserDownloadInfo | null
    const now = Date.now()

    if (!userInfo || now >= userInfo.reset) {
      return NextResponse.json({
        remaining: MAX_IMAGES,
        reset: now + RATE_LIMIT_DURATION,
        total: MAX_IMAGES,
        downloadedCount: 0,
        awaitingDownload: 0,
      })
    }

    // Ensure awaitingDownload is always included in the response
    const awaitingDownloadCount = userInfo.awaitingDownload?.length || 0

    const rateLimitInfo: RateLimitInfo = {
      remaining: Math.max(0, MAX_IMAGES - userInfo.count),
      reset: userInfo.reset,
      total: MAX_IMAGES,
    }

    return NextResponse.json({
      ...rateLimitInfo,
      awaitingDownload: awaitingDownloadCount,
      // Include a flag to indicate if there are awaiting downloads
      hasAwaitingDownloads: awaitingDownloadCount > 0,
    })
  } catch (error) {
    console.error('Error getting rate limit info:', error)
    return NextResponse.json({ error: 'Failed to get rate limit info' }, { status: 500 })
  }
}

export const POST = async (req: NextRequest) => {
  try {
    // Check if this is a reset action request
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Handle reset action if requested
    if (action === 'reset') {
      const ipAddress = req.headers.get('x-forwarded-for')
      if (!ipAddress) {
        return NextResponse.json({ error: 'Unable to determine client IP' }, { status: 400 })
      }

      const userKey = getUserKey(ipAddress)
      const now = Date.now()

      // Get current user info to preserve the count and reset time
      const currentUserInfo = (await kv.get(userKey)) as UserDownloadInfo | null

      await kv.set(userKey, {
        // Preserve the existing count to maintain rate limiting
        count: currentUserInfo?.count || 0,
        reset: currentUserInfo?.reset || now + RATE_LIMIT_DURATION,
        awaitingDownload: [], // Clear the awaiting download images array
      })

      return NextResponse.json({
        message: 'Download history reset successfully',
        remaining: Math.max(0, MAX_IMAGES - (currentUserInfo?.count || 0)),
        reset: currentUserInfo?.reset || now + RATE_LIMIT_DURATION,
        total: MAX_IMAGES,
        downloadedCount: 0,
        awaitingDownload: 0,
        hasAwaitingDownloads: false,
      })
    }

    // Regular download functionality continues below
    const { html, downloadMode = 'all' } = await req.json()

    // Add validation
    if (downloadMode === 'all' && (!html || typeof html !== 'string')) {
      return NextResponse.json({ error: 'Invalid HTML content provided' }, { status: 400 })
    }

    // Add length validation to match client-side limit (only for 'all' mode)
    if (downloadMode === 'all' && html.length > MAX_CHARACTERS) {
      return NextResponse.json(
        { error: `Input too large (max ${MAX_CHARACTERS.toLocaleString()} characters)` },
        { status: 400 },
      )
    }

    // Get user's IP address for rate limiting
    const ipAddress = req.headers.get('x-forwarded-for')
    if (!ipAddress) {
      return NextResponse.json({ error: 'Unable to determine client IP' }, { status: 400 })
    }

    const userKey = getUserKey(ipAddress)

    // Get user's rate limit info
    let userInfo = (await kv.get(userKey)) as UserDownloadInfo | null
    const now = Date.now()

    // Initialize or reset if expired
    if (!userInfo || now >= userInfo.reset) {
      userInfo = {
        count: 0,
        reset: now + RATE_LIMIT_DURATION,
        awaitingDownload: [],
      }
      await kv.set(userKey, userInfo)
    }

    // Handle different download modes
    let imagesToDownload: ImageInfo[] = []

    if (downloadMode === 'all') {
      // Parse HTML to extract image URLs
      const $ = cheerio.load(html)
      imagesToDownload = $('a.originalLink_af017a')
        .map((i, link) => {
          const href = $(link).attr('href')
          if (!href) return null
          // Extract file extension from URL
          const [urlPart] = href.split('?') // Remove query parameters
          const extMatch = urlPart.split('.').pop()
          // Ensure extension is a string, default to 'jpg' if undefined
          const extension = extMatch || 'jpg'

          return { url: href, extension }
        })
        .get()
        .filter(Boolean) as ImageInfo[] // Cast to ImageInfo[] after filtering

      if (imagesToDownload.length === 0) {
        return NextResponse.json({ error: 'No images found' }, { status: 404 })
      }
    } else if (downloadMode === 'remaining' || downloadMode === 'awaiting') {
      // Only download images that are awaiting download
      if (!userInfo.awaitingDownload || userInfo.awaitingDownload.length === 0) {
        return NextResponse.json(
          {
            message: 'No images awaiting download',
            awaitingDownload: 0,
            hasAwaitingDownloads: false,
          },
          { status: 200 },
        )
      }

      // Convert the awaiting download URLs to ImageInfo objects
      imagesToDownload = userInfo.awaitingDownload.map((url) => {
        // Extract file extension from URL
        const [urlPart] = url.split('?') // Remove query parameters
        const extMatch = urlPart.split('.').pop()
        // Ensure extension is a string, default to 'jpg' if undefined
        const extension = extMatch || 'jpg'

        return {
          url,
          extension,
        }
      })
    }

    const requestedImages = imagesToDownload.length

    // Check if we're exceeding rate limits
    let partialDownload = false
    let availableSlots = MAX_IMAGES - userInfo.count
    let remainingImages: ImageInfo[] = []

    if (requestedImages > availableSlots) {
      if (availableSlots <= 0) {
        // Store all images as awaiting download if we can't download any
        if (downloadMode === 'all') {
          // Update the awaiting download array with new images
          const updatedAwaitingDownload = [
            ...userInfo.awaitingDownload,
            ...imagesToDownload.map((img) => img.url),
          ]

          // Use a Set to ensure uniqueness
          const uniqueAwaitingDownload = [...new Set(updatedAwaitingDownload)]

          await kv.set(userKey, {
            ...userInfo,
            awaitingDownload: uniqueAwaitingDownload,
          })
        }

        const rateLimitInfo: RateLimitInfo = {
          remaining: 0,
          reset: userInfo.reset,
          total: MAX_IMAGES,
        }

        // Calculate the total awaiting downloads
        const awaitingDownloadCount =
          downloadMode === 'all'
            ? (userInfo.awaitingDownload?.length || 0) + imagesToDownload.length
            : userInfo.awaitingDownload?.length || 0

        return NextResponse.json(
          {
            error: `Rate limit exceeded (${MAX_IMAGES} images/20 minutes)`,
            rateLimitInfo,
            awaitingDownload: awaitingDownloadCount,
            totalImages: imagesToDownload.length,
            hasAwaitingDownloads: awaitingDownloadCount > 0,
          },
          { status: 429 },
        )
      }

      // Partial download - only download what's available
      partialDownload = true
      remainingImages = imagesToDownload.slice(availableSlots)
      imagesToDownload = imagesToDownload.slice(0, availableSlots)
    }

    // Create a new archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level
    })

    // Create a transform stream that we can convert to a Response
    const chunks: Uint8Array[] = []
    archive.on('data', (chunk: Uint8Array) => chunks.push(chunk))

    // Handle archiver warnings
    archive.on('warning', (err: any) => {
      if (err.code === 'ENOENT') {
        console.warn('Archiver warning:', err)
      } else {
        throw err
      }
    })

    // Handle archiver errors
    archive.on('error', (err: any) => {
      throw err
    })

    // Download and add files to the archive
    const downloadedImageUrls: string[] = []

    await Promise.all(
      imagesToDownload.map(async ({ url, extension }, index) => {
        try {
          const response = await axios.get(url, { responseType: 'arraybuffer' })
          const stream = Readable.from(Buffer.from(response.data))
          archive.append(stream, { name: `image_${index}.${extension}` })
          downloadedImageUrls.push(url)
        } catch (error) {
          console.error(`Failed to download image ${url}:`, error)
          // Continue with other images even if one fails
        }
      }),
    )

    // Finalize the archive
    await archive.finalize()

    // Update the awaiting download list with remaining images
    const awaitingDownload = remainingImages.map((img) => img.url)

    // If we're in 'remaining' mode, we've downloaded everything that was awaiting
    // If we're in 'all' mode and have a partial download, store the remaining images

    // After successful download, update the user's rate limit info
    const newCount = userInfo.count + downloadedImageUrls.length

    // Calculate the new awaiting download list based on the download mode
    let newAwaitingDownload: string[] = []

    if (downloadMode === 'all') {
      // For 'all' mode, keep only the remaining images that couldn't be downloaded
      newAwaitingDownload = [...awaitingDownload]
    } else if (downloadMode === 'remaining' || downloadMode === 'awaiting') {
      // For 'remaining' mode, filter out the successfully downloaded images from the awaiting list
      newAwaitingDownload = userInfo.awaitingDownload.filter(
        (url) => !downloadedImageUrls.includes(url),
      )
    }

    await kv.set(userKey, {
      count: newCount,
      reset: userInfo.reset,
      awaitingDownload: newAwaitingDownload,
    })

    // Create rate limit info for response header
    const updatedRateLimitInfo: RateLimitInfo = {
      remaining: Math.max(0, MAX_IMAGES - newCount),
      reset: userInfo.reset,
      total: MAX_IMAGES,
      downloadedCount: downloadedImageUrls.length,
      totalImages: downloadMode === 'all' ? imagesToDownload.length : downloadedImageUrls.length,
      remainingImages: awaitingDownload.length,
      partialDownload,
      awaitingDownload: newAwaitingDownload.length,
      hasAwaitingDownloads: newAwaitingDownload.length > 0,
    }

    // Set rate limit info in response header
    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set('Content-Disposition', 'attachment; filename="images.zip"')
    headers.set('X-RateLimit-Info', JSON.stringify(updatedRateLimitInfo))

    // Create a new response with the zip data and headers
    const response = new Response(Buffer.concat(chunks), {
      headers,
    })

    return response
  } catch (error) {
    console.error('Error downloading images:', error)
    return NextResponse.json({ error: 'Failed to download images' }, { status: 500 })
  }
}
