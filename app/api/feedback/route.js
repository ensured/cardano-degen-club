import { Resend } from 'resend'
import { kv } from '@vercel/kv'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

// Update rate limit configuration
const RATE_LIMITS = [
  {
    name: 'short',
    window: 600,
    maxRequests: 2,
    errorMessage: (ttl) =>
      `Please try again in ${Math.floor(ttl / 60)}m ${ttl % 60}s. Limit 2 requests per 10 minutes.`,
  },
  {
    name: 'long',
    window: 86400,
    maxRequests: 10,
    errorMessage: (ttl) =>
      `Maximum 10 requests per 12 hours. Please try again in ${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m ${ttl % 60}s.`,
  },
]

// Add validation schema matching client-side
const feedbackSchema = z.object({
  feedback: z.string().min(1).max(2000),
})

export async function POST(request) {
  try {
    // Get user identifier (wallet address or IP)
    const identifier =
      request.headers.get('x-wallet-address') ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      'anonymous'

    // Check all rate limits
    for (const limit of RATE_LIMITS) {
      const tierKey = `feedback:${identifier}:${limit.name}`
      const current = await kv.get(tierKey)

      if (current && current.count >= limit.maxRequests) {
        const ttl = await kv.ttl(tierKey)
        return new Response(JSON.stringify({ error: limit.errorMessage(ttl) }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Increment all rate limits
    for (const limit of RATE_LIMITS) {
      const tierKey = `feedback:${identifier}:${limit.name}`
      const current = await kv.get(tierKey)

      await kv.set(
        tierKey,
        {
          count: current ? current.count + 1 : 1,
          lastRequest: Date.now(),
        },
        { ex: limit.window, nx: !current },
      )
    }

    // Validate request body
    const body = await request.json()
    const validation = feedbackSchema.safeParse(body)

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid feedback',
          issues: validation.error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Use validated data
    const { feedback } = validation.data

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM,
      to: process.env.RESEND_EMAIL_TO,
      subject: 'New Feedback!',
      text: feedback,
    })

    if (error) {
      console.error('Resend error:', error)
      return new Response(JSON.stringify({ success: false, error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Update error handling to include Zod errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          issues: error.issues,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
