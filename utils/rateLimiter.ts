import { kv } from '@vercel/kv'
import { headers } from 'next/headers'

export const runtime = 'edge'

interface RateLimitInfo {
  count: number
  timestamp: number
}

export async function checkRateLimit(identifier: string) {
  const now = Date.now()
  const window = 15000 // 15 seconds in milliseconds
  const maxRequests = 5

  const key = `ratelimit:${identifier}`
  const rateLimitInfo = await kv.get<RateLimitInfo>(key)

  if (!rateLimitInfo) {
    // First request in the window
    await kv.set(key, { count: 1, timestamp: now }, { ex: 10 }) // Expire in 10 seconds
    return {
      success: true,
      remaining: maxRequests - 1,
      reset: now + window,
    }
  }

  // Check if the window has expired
  if (now - rateLimitInfo.timestamp >= window) {
    // Start a new window
    await kv.set(key, { count: 1, timestamp: now }, { ex: 10 })
    return {
      success: true,
      remaining: maxRequests - 1,
      reset: now + window,
    }
  }

  // Check if rate limit is exceeded
  if (rateLimitInfo.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: rateLimitInfo.timestamp + window,
      message: `Rate limit exceeded. Try again in ${Math.ceil((rateLimitInfo.timestamp + window - now) / 1000)} seconds`,
    }
  }

  // Increment the counter
  await kv.set(
    key,
    { count: rateLimitInfo.count + 1, timestamp: rateLimitInfo.timestamp },
    { ex: Math.ceil((window - (now - rateLimitInfo.timestamp)) / 1000) },
  )

  return {
    success: true,
    remaining: maxRequests - (rateLimitInfo.count + 1),
    reset: rateLimitInfo.timestamp + window,
  }
}

export async function getClientIp() {
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const cfConnectingIp = headersList.get('cf-connecting-ip')
  const xRealIp = headersList.get('x-real-ip')

  return forwardedFor?.split(',')[0] || cfConnectingIp || xRealIp || 'unknown'
}
