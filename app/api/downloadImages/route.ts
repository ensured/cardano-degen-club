import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import JSZip from 'jszip'
import * as cheerio from 'cheerio'

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

    const zip = new JSZip()
    await Promise.all(
      imageUrls.map(async (url, index) => {
        const response = await axios.get(url, { responseType: 'arraybuffer' })
        zip.file(`image_${index}.gif`, response.data)
      }),
    )

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })
    const zipBlob = new Blob([zipContent], { type: 'application/zip' })

    return new Response(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=images.zip',
      },
    })
  } catch (error) {
    console.error('Error downloading images:', error)
    return NextResponse.json({ error: 'Failed to download images' }, { status: 500 })
  }
}
