import { getGameStats, clients } from '../utils/utils'

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)
      const stats = getGameStats()
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(stats)}\n\n`))
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
