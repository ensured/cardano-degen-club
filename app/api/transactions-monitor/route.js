import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { type, payload } = await request.json()
    return NextResponse.json({ processed: true, type, payload }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
