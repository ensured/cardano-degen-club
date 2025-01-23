import { NextResponse } from 'next/server'
import { connectedUsers, waitingUsers, activeMatches } from '../utils/state'

export async function GET() {
  return NextResponse.json({
    connectedCount: connectedUsers.size,
    waitingCount: waitingUsers.size,
    activeMatchesCount: activeMatches.size,
  })
}
