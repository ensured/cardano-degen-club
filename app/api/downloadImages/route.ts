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
}

export const GET = async (req: NextRequest) => {
  try {
    const ipAddress = req.headers.get('x-forwarded-for')
    if (!ipAddress) {
      return NextResponse.json({ error: 'Unable to determine client IP' }, { status: 400 })
    }

    const userKey = `imgDL:${ipAddress}`
    const userInfo = (await kv.get(userKey)) as { count: number; reset: number } | null
    const now = Date.now()

    if (!userInfo || now >= userInfo.reset) {
      return NextResponse.json({
        remaining: 500,
        reset: now + 3600000,
        total: 500,
      })
    }

    const rateLimitInfo: RateLimitInfo = {
      remaining: Math.max(0, 500 - userInfo.count),
      reset: userInfo.reset,
      total: 500,
    }

    return NextResponse.json(rateLimitInfo)
  } catch (error) {
    console.error('Error getting rate limit info:', error)
    return NextResponse.json({ error: 'Failed to get rate limit info' }, { status: 500 })
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const { html } = await req.json()

    // Add validation
    if (!html || typeof html !== 'string') {
      return NextResponse.json({ error: 'Invalid HTML content provided' }, { status: 400 })
    }

    const $ = cheerio.load(html)
    const imageUrls = $('a.originalLink_af017a')
      .map((i, link) => $(link).attr('href'))
      .get()

    if (imageUrls.length === 0) {
      return NextResponse.json({ error: 'No images found' }, { status: 404 })
    }

    // Add rate limiting
    const ipAddress = req.headers.get('x-forwarded-for')
    if (!ipAddress) {
      return NextResponse.json({ error: 'Unable to determine client IP' }, { status: 400 })
    }

    const userKey = `imgDL:${ipAddress}`
    const requestedImages = imageUrls.length

    // Get user's rate limit info
    let userInfo = (await kv.get(userKey)) as { count: number; reset: number } | null
    const now = Date.now()

    // Initialize or reset if expired
    if (!userInfo || now >= userInfo.reset) {
      await kv.set(userKey, {
        count: 0,
        reset: now + 3600000, // 1 hour from now
      })
      userInfo = { count: 0, reset: now + 3600000 }
    }

    if (userInfo.count + requestedImages > 500) {
      const rateLimitInfo: RateLimitInfo = {
        remaining: Math.max(0, 500 - userInfo.count),
        reset: userInfo.reset,
        total: 500,
      }
      return NextResponse.json(
        {
          error: 'Rate limit exceeded (500 images/hour)',
          rateLimitInfo,
        },
        { status: 429 },
      )
    }

    // Update rate limit counter
    await kv.set(userKey, {
      count: userInfo.count + requestedImages,
      reset: userInfo.reset,
    })

    // Create a new archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level
    })

    // Create a transform stream that we can convert to a Response
    const chunks: Uint8Array[] = []
    archive.on('data', (chunk) => chunks.push(chunk))

    // Handle archiver warnings
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archiver warning:', err)
      } else {
        throw err
      }
    })

    // Handle archiver errors
    archive.on('error', (err) => {
      throw err
    })

    // Download and add files to the archive
    await Promise.all(
      imageUrls.map(async (url, index) => {
        const response = await axios.get(url, { responseType: 'arraybuffer' })
        const stream = Readable.from(Buffer.from(response.data))
        archive.append(stream, { name: `image_${index}.gif` })
      }),
    )

    // Finalize the archive
    await archive.finalize()

    // Concatenate all chunks into a single buffer
    const zipBuffer = Buffer.concat(chunks)
    const zipBlob = new Blob([zipBuffer], { type: 'application/zip' })

    // Update rate limit info for response headers
    const rateLimitInfo: RateLimitInfo = {
      remaining: 500 - (userInfo.count + requestedImages),
      reset: userInfo.reset,
      total: 500,
    }

    return new Response(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=images.zip',
        'X-RateLimit-Info': JSON.stringify(rateLimitInfo),
      },
    })
  } catch (error) {
    console.error('Error downloading images:', error)
    return NextResponse.json({ error: 'Failed to download images' }, { status: 500 })
  }
}
