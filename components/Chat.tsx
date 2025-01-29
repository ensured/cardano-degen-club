import { useState } from 'react'

const Chat = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([])

  const handleSend = async () => {
    if (!input) return

    const userMessage = { user: input, bot: '' }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
    })

    const data = await response.json()
    if (data.error) {
      console.error(data.error)
      return
    }

    setMessages((prev) => {
      const updatedMessages = [...prev]
      updatedMessages[updatedMessages.length - 1].bot = data.generated_text // Adjust based on the response structure
      return updatedMessages
    })
  }

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>User:</strong> {msg.user}
            <br />
            <strong>Bot:</strong> {msg.bot}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  )
}

export default Chat
