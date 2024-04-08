import { NextResponse, type NextRequest } from "next/server"

import rateLimitMiddleware from "../middleware/rateLimiter"

export async function middleware(req: NextRequest, res: NextResponse) {
  if (!rateLimitMiddleware(req)) {
    return new NextResponse("Rate limit exceeded", { status: 429 })
  }
  console.log("middleware fired")
  return req.nextUrl
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/:path*",
}
