import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Use the URL constructor to access the search parameters
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get("imageUrl");
    
    if (!imageUrl) {
      return new Response("Image URL not provided", { status: 400 });
    }

    const response = await fetch(imageUrl);
    
    // Check if the response is okay
    if (!response.ok) {
      return new Response("Failed to fetch image", { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer(); // Use arrayBuffer instead of buffer
    const imageBase64 = Buffer.from(imageBuffer).toString("base64"); // Convert buffer to Base64

    return new NextResponse(imageBase64, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "image/jpeg", // Set content type based on your image type
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
