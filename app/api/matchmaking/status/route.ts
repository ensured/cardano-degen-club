import { NextResponse } from 'next/server'
import { connectedUsers, waitingUsers, activeMatches } from '../utils/state'

export async function GET() {
  return NextResponse.json({
    connectedCount: connectedUsers.size,
    waitingCount: waitingUsers.size,
    activeMatchesCount: activeMatches.size,
  })
}

// Export these to be used in the main matchmaking endpoint
export { waitingUsers, activeMatches, connectedUsers }
