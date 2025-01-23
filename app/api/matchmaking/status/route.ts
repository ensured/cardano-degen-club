import { NextResponse } from 'next/server'

// Track all connected users, not just those waiting to match
const connectedUsers = new Set<string>()
const waitingUsers = new Set<string>()
const activeMatches = new Set<string>()

export async function GET() {
  return NextResponse.json({
    connectedCount: connectedUsers.size,
    waitingCount: waitingUsers.size,
    activeMatchesCount: activeMatches.size,
  })
}

// Export these to be used in the main matchmaking endpoint
export { waitingUsers, activeMatches, connectedUsers }
