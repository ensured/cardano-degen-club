import { connectedUsers, waitingUsers, activeMatches } from '../status/route'

// Types
type GameStats = {
  connectedCount: number
  waitingCount: number
  activeMatchesCount: number
}

// Store all active SSE clients with their controllers
const clients = new Set<ReadableStreamController<Uint8Array>>()

// Helper functions
function getGameStats(): GameStats {
  return {
    connectedCount: connectedUsers.size,
    waitingCount: waitingUsers.size,
    activeMatchesCount: activeMatches.size,
  }
}

function sendStatsToClient(
  controller: ReadableStreamController<Uint8Array>,
  encoder: TextEncoder,
  stats: GameStats,
) {
  try {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(stats)}\n\n`))
    return true
  } catch (error) {
    console.error('Error sending stats:', error)
    clients.delete(controller)
    return false
  }
}

// Main route handler
export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)
      sendStatsToClient(controller, encoder, getGameStats())

      return () => clients.delete(controller)
    },
    cancel(controller) {
      clients.delete(controller)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
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
