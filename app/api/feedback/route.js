import { Resend } from 'resend'
import { kv } from '@vercel/kv'

const resend = new Resend(process.env.RESEND_API_KEY)

// Rate limit configuration
const RATE_LIMIT = {
  WINDOW: 3600, // 1 hour in seconds
  MAX_REQUESTS: 5, // Max 5 requests per hour
}

export async function POST(request) {
  try {
    // Get user identifier (wallet address or IP)
    const identifier =
      request.headers.get('x-wallet-address') ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      'anonymous'

    const key = `feedback:${identifier}`

    // Get current count
    const current = await kv.get(key)

    // Check rate limit
    if (current && current.count >= RATE_LIMIT.MAX_REQUESTS) {
      const ttl = await kv.ttl(key)
      return new Response(
        JSON.stringify({
          error: `Please try again in ${Math.ceil(ttl / 60)} minutes. Max 5 requests per hour.`,
        }),

        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Increment count or create new entry
    await kv.set(
      key,
      {
        count: current ? current.count + 1 : 1,
        lastRequest: Date.now(),
      },
      { ex: RATE_LIMIT.WINDOW, nx: !current },
    )

    // Process feedback
    const { feedback } = await request.json()

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM_FEEDBACK,
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
