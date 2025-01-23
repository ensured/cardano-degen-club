'use client'

import { useEffect, useState } from 'react'
import { Peer, DataConnection } from 'peerjs'
import { Button } from '@/components/ui/button'
import { AlertCircle, MessageCircle, ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'

// Types
type Message = {
  sender: string
  text: string
  senderName: string
}

type GameStats = {
  connectedCount: number
  waitingCount: number
  activeMatchesCount: number
}

type ChatData = {
  type: 'chat'
  sender: string
  text: string
  senderName: string
}

type LeaveData = {
  type: 'leave'
  sender: string
}

type PeerData = ChatData | LeaveData | string

// Components
const ChatMessage = ({ message, isOwn }: { message: Message; isOwn: boolean }) => (
  <div
    className={`mb-2 rounded-lg border p-2 ${
      isOwn
        ? 'border-primary bg-black/10'
        : 'ml-auto border-black bg-primary text-primary-foreground'
    } max-w-[80%] break-words`}
  >
    <div className="text-xs opacity-75">{isOwn ? 'You' : message.senderName}</div>
    <div>{message.text}</div>
  </div>
)

const StatsDisplay = ({ stats }: { stats: GameStats }) => (
  <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
    <div className="rounded-lg bg-secondary px-3 py-1">👥 Connected: {stats.connectedCount}</div>
    <div className="rounded-lg bg-secondary px-3 py-1">🔄 Searching: {stats.waitingCount}</div>
    <div className="rounded-lg bg-secondary px-3 py-1">🎮 In Game: {stats.activeMatchesCount}</div>
  </div>
)

const GamePage = () => {
  // Connection state
  const [peer, setPeer] = useState<Peer | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [connection, setConnection] = useState<DataConnection | null>(null)
  const [isMatching, setIsMatching] = useState(false)
  const [lobbyUsers, setLobbyUsers] = useState<string[]>([])

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')

  // Game state
  const [stats, setStats] = useState<GameStats>({
    connectedCount: 0,
    waitingCount: 0,
    activeMatchesCount: 0,
  })
  const [opponentLeft, setOpponentLeft] = useState<string | null>(null)

  // Add new state for names
  const [playerName, setPlayerName] = useState('')
  const [hasSetName, setHasSetName] = useState(false)

  const handlePeerData = (data: PeerData) => {
    if (typeof data === 'object' && 'type' in data) {
      if (data.type === 'chat') {
        setMessages((prev) => [
          ...prev,
          { sender: data.sender, text: data.text, senderName: data.senderName },
        ])
      } else if (data.type === 'leave') {
        setOpponentLeft(data.sender)
        if (connection) {
          connection.close()
        }
        cancelMatchmaking()
      }
    } else if (typeof data === 'string') {
      setLobbyUsers((prev) => [...prev, data])
    }
  }

  const handleConnectionClose = () => {
    setConnection(null)
    setIsMatching(false)
    setLobbyUsers([])
    setMessages([])
    setOpponentLeft((prev) => prev || 'Opponent')
  }

  const setupPeer = () => {
    const newPeer = new Peer()
    setPeer(newPeer)

    newPeer.on('open', async (id) => {
      setPlayerId(id)
      await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: id, action: 'connect' }),
      })
    })

    newPeer.on('connection', (conn) => {
      setConnection(conn)
      toast.success('Match found!')
      conn.on('data', (data: unknown) => {
        handlePeerData(data as PeerData)
      })
      conn.on('close', handleConnectionClose)
    })

    return () => {
      if (playerId) {
        fetch('/api/matchmaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, action: 'disconnect' }),
        })
      }
      newPeer.destroy()
    }
  }

  useEffect(() => {
    return setupPeer()
  }, [])

  useEffect(() => {
    let eventSource: EventSource | null = null

    const connectSSE = () => {
      eventSource = new EventSource('/api/matchmaking/events')

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setStats(data)
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        if (eventSource) {
          eventSource.close()
          // Try to reconnect after a delay
          setTimeout(connectSSE, 1000)
        }
      }
    }

    connectSSE()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  const startMatchmaking = async () => {
    if (!peer || !playerId) return

    setIsMatching(true)
    setOpponentLeft(null)

    try {
      const response = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, action: 'join' }),
      })

      const data = await response.json()

      if (data.status === 'matched') {
        const conn = peer.connect(data.opponentId)
        setConnection(conn)

        conn.on('open', () => {
          toast.success(`Match found!`)
          conn.send(playerId)
          setLobbyUsers([playerId])
        })

        conn.on('data', (data: unknown) => {
          handlePeerData(data as PeerData)
        })
      }
    } catch (error) {
      console.error('Matchmaking error:', error)
      setIsMatching(false)
    }
  }

  const cancelMatchmaking = async () => {
    if (!playerId) return

    try {
      if (connection) {
        connection.send({ type: 'leave', sender: playerId })
        connection.close()
      }

      await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, action: 'leave' }),
      })
    } finally {
      setIsMatching(false)
      setLobbyUsers([])
      setConnection(null)
      setMessages([])
      setOpponentLeft(null)
    }
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!connection || !messageInput.trim() || !playerId) return

    const messageData: ChatData = {
      type: 'chat',
      sender: playerId,
      text: messageInput.trim(),
      senderName: playerName,
    }

    connection.send(messageData)
    setMessages((prev) => [
      ...prev,
      { sender: playerId, text: messageInput.trim(), senderName: playerName },
    ])
    setMessageInput('')
  }

  return (
    <div className="flex min-h-[69vh] flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-3xl font-bold">Game Room</h1>

      {/* Add stats display */}
      <StatsDisplay stats={stats} />

      <div className="flex w-full max-w-md flex-col space-y-3.5">
        {!hasSetName ? (
          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-2 text-lg font-semibold">Enter Your Name</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (playerName.trim()) {
                  setHasSetName(true)
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2"
                required
                minLength={1}
                maxLength={20}
              />
              <Button type="submit">Set Name</Button>
            </form>
          </div>
        ) : (
          <>
            <Button onClick={isMatching ? cancelMatchmaking : startMatchmaking} className="w-full">
              {connection ? (
                'Leave Game'
              ) : (
                <>
                  {isMatching ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Searching...
                    </>
                  ) : (
                    'Find Match'
                  )}
                </>
              )}
            </Button>

            {(lobbyUsers.length > 0 || playerId) && (
              <Collapsible className="rounded-lg border border-border/50 bg-secondary/20 text-sm">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-3 transition-colors hover:bg-secondary/30">
                  <span className="font-medium">Connection Details</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 border-t border-border/50 px-3 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs">
                      {lobbyUsers[0]}
                    </code>
                  </div>
                  {playerId && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Player ID:</span>
                      <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs">
                        {playerId}
                      </code>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            {opponentLeft ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center dark:border-yellow-900 dark:bg-yellow-900/20">
                <p className="text-yellow-800 dark:text-yellow-200">
                  {opponentLeft} has left the chat
                </p>
                <Button
                  onClick={() => {
                    setOpponentLeft(null)
                    setMessages([])
                    setIsMatching(false)
                    // search for new match
                    startMatchmaking()
                  }}
                  variant="outline"
                  className="mt-2"
                >
                  Find New Match
                </Button>
              </div>
            ) : connection ? (
              <div className="rounded-lg border border-border p-4">
                <div className="mb-4 h-96 overflow-y-auto rounded-lg bg-secondary p-4">
                  {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} isOwn={msg.sender === playerId} />
                  ))}
                </div>

                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2"
                  />
                  <Button type="submit">Send</Button>
                </form>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default GamePage
