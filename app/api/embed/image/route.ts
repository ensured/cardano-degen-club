import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Use the request's nextUrl directly to maintain context
    const imageUrl = request.nextUrl.searchParams.get("imageUrl");

    if (!imageUrl) {
      return new Response("Image URL not provided", { status: 400 });
    }

    // Fetch the image while maintaining context
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new Response("Failed to fetch image", { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    return new NextResponse(imageBase64, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "image/jpeg", // Adjust based on the image type
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
