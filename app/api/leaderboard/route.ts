import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT username, score, created_at
      FROM leaderboard
      ORDER BY score DESC
      LIMIT 100
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { username, score } = await req.json()

    // Basic validation
    if (!username || typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'Invalid username or score' }, { status: 400 })
    }

    // Insert new score
    const { rows } = await sql`
      INSERT INTO leaderboard (username, score)
      VALUES (${username}, ${score})
      RETURNING id, username, score, created_at
    `

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error saving score:', error)
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
  }
}
