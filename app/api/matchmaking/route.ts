import { NextResponse } from 'next/server'
import { waitingUsers, activeMatches, connectedUsers } from './status/route'
import { broadcastStats } from './events/route'

export async function POST(req: Request) {
  const { playerId, action } = await req.json()

  if (action === 'connect') {
    // Track new connection
    connectedUsers.add(playerId)
    broadcastStats()
    return NextResponse.json({ status: 'connected' })
  }

  if (action === 'disconnect') {
    // Find and remove opponent from active matches
    let opponentId = null
    for (const activePlayer of activeMatches) {
      if (activePlayer !== playerId) {
        opponentId = activePlayer
        break
      }
    }

    // Clean up both players
    if (opponentId) {
      activeMatches.delete(opponentId)
    }
    connectedUsers.delete(playerId)
    waitingUsers.delete(playerId)
    activeMatches.delete(playerId)
    broadcastStats()

    return NextResponse.json({ status: 'disconnected' })
  }

  if (action === 'join') {
    // If player is already in an active match, return that info
    if (activeMatches.has(playerId)) {
      return NextResponse.json({ status: 'already_matched' })
    }

    // If there's already a player waiting
    if (waitingUsers.size > 0) {
      const [opponent] = waitingUsers
      waitingUsers.delete(opponent)
      // Add both players to active matches
      activeMatches.add(playerId)
      activeMatches.add(opponent)
      broadcastStats()
      return NextResponse.json({ status: 'matched', opponentId: opponent })
    }

    // If no players waiting, add to queue
    waitingUsers.add(playerId)
    broadcastStats()
    return NextResponse.json({ status: 'waiting' })
  }

  if (action === 'leave') {
    // Find and remove opponent from active matches
    let opponentId = null
    for (const activePlayer of activeMatches) {
      if (activePlayer !== playerId) {
        opponentId = activePlayer
        break
      }
    }

    // Clean up both players
    if (opponentId) {
      activeMatches.delete(opponentId)
    }
    waitingUsers.delete(playerId)
    activeMatches.delete(playerId)
    broadcastStats()

    return NextResponse.json({ status: 'left' })
  }

  return NextResponse.json({ status: 'error', message: 'Invalid action' })
}

export async function GET() {
  return NextResponse.json({ waitingPlayers: Array.from(waitingUsers) })
}
