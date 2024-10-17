import MemoryCache from "memory-cache"; // Assuming you are using this library
import { headers } from "next/headers"; // Assuming you're in a Next.js app


export const runtime = 'edge'

// A reusable rate-limiting function
// (limitTimeout in milliseconds)
export async function checkRateLimit(key:string,ip: string, limitTimeout: number) {
  const now = Date.now();
  const cacheKey = `${key}-${ip}`;
  const lastSubmission = MemoryCache.get(cacheKey);

  if (lastSubmission && now - lastSubmission < limitTimeout) {
    const retryAfter = Math.ceil((limitTimeout - (now - lastSubmission)) / 1000);
    return {
      success: false,
      retryAfter,
      message: `Rate limit exceeded, please try again in ${retryAfter} seconds.`,
    };
  }

  // Cache the time of this request
  MemoryCache.put(cacheKey, now, limitTimeout);

  return { success: true, message: "Request allowed." };
}

// Get client IP from headers (can be used for both rate-limiting and feedback)
export function getClientIp() {
  const forwardedFor = headers().get("x-forwarded-for");
  return forwardedFor ? forwardedFor.split(",")[0] : null;
}
