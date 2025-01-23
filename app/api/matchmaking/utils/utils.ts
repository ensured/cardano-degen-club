import { connectedUsers, waitingUsers, activeMatches } from '../status/route'

// Types
type GameStats = {
  connectedCount: number
  waitingCount: number
  activeMatchesCount: number
}

// Store all active SSE clients with their controllers
export const clients = new Set<ReadableStreamController<Uint8Array>>()

// Helper functions
export function getGameStats(): GameStats {
  return {
    connectedCount: connectedUsers.size,
    waitingCount: waitingUsers.size,
    activeMatchesCount: activeMatches.size,
  }
}

// Broadcast function
export function broadcastStats() {
  const stats = getGameStats()
  const encoder = new TextEncoder()
  const message = encoder.encode(`data: ${JSON.stringify(stats)}\n\n`)

  for (const client of clients) {
    try {
      client.enqueue(message)
    } catch {
      clients.delete(client)
    }
  }
}
