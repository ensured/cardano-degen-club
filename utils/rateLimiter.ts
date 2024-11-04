import { headers } from "next/headers"
import MemoryCache from "memory-cache"

export const runtime = "edge"

interface RateLimitResponse {
  success: boolean
  message: string
  remainingAttempts?: number
  resetTime?: Date
}

interface RateLimitConfig {
  maxAttempts?: number  // Maximum attempts within the timeout period
  limitTimeout: number  // Timeout in milliseconds
  key: string          // Unique identifier for the rate limit
  ip: string          // Client IP
}

export async function checkRateLimit({
  maxAttempts = 2,
  limitTimeout,
  key,
  ip
}: RateLimitConfig): Promise<RateLimitResponse> {
  if (!ip) {
    throw new Error("IP address is required for rate limiting")
  }

  const now = Date.now()
  const cacheKey = `${key}-${ip}`
  const attempts = MemoryCache.get(cacheKey) || { count: 0, firstAttempt: now }

  // Reset attempts if the timeout has passed
  if (now - attempts.firstAttempt >= limitTimeout) {
    attempts.count = 0
    attempts.firstAttempt = now
  }

  // Increment attempt counter
  attempts.count++

  if (attempts.count > maxAttempts) {
    const resetTime = new Date(attempts.firstAttempt + limitTimeout)
    const retryAfter = Math.ceil((limitTimeout - (now - attempts.firstAttempt)) / 1000)
    
    return {
      success: false,
      message: `Rate limit exceeded, please try again in ${retryAfter} seconds.`,
      remainingAttempts: 0,
      resetTime
    }
  }

  // Update cache
  MemoryCache.put(cacheKey, attempts, limitTimeout)

  return {
    success: true,
    message: "Request allowed.",
    remainingAttempts: maxAttempts - attempts.count,
    resetTime: new Date(attempts.firstAttempt + limitTimeout)
  }
}

export function getClientIp(): string {
  const headersList = headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const cfConnectingIp = headersList.get("cf-connecting-ip")
  const xRealIp = headersList.get("x-real-ip")

  return (
    forwardedFor?.split(",")[0] ||
    cfConnectingIp ||
    xRealIp ||
    "0.0.0.0" // fallback IP
  )
}
