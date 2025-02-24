import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/utils/rateLimiter'

export const runtime = 'edge'

export async function GET() {
  try {
    // Rate limiting
    const identifier = await getClientIp()
    const rateLimitResult = await checkRateLimit(identifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.reset) } },
      )
    }

    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    const data = await response.json()

    return NextResponse.json({ title: data.meals[0].strMeal })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 })
  }
}
