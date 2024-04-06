import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get("imageUrl")
    if (!imageUrl) {
      return new Response("Image URL not provided", { status: 400 })
    }
    const response = await fetch(imageUrl)
    const imageBuffer = await response.arrayBuffer() // Use arrayBuffer instead of buffer
    const imageBase64 = Buffer.from(imageBuffer).toString("base64") // Convert buffer to Base64

    return new NextResponse(imageBase64, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    console.error(err)
    return new Response("Internal Server Error", { status: 500 })
  }
}
