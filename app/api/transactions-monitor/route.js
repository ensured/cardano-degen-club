import { Resend } from 'resend'
import { kv } from '@vercel/kv'

const resend = new Resend(process.env.RESEND_API_KEY)

// Rate limit configuration
const MONITORING_LIMIT = {
  WINDOW: 86400, // 24 hours
  MAX_REQUESTS: 3, // Max 3 checks per day
}

export async function POST(request) {
  try {
    const { address, blockfrostKey } = await request.json()

    // Validate input
    if (!address || !blockfrostKey) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Add network detection
    const isTestnet = address.startsWith('addr_test')
    const blockfrostUrl = `https://cardano-${isTestnet ? 'preview' : 'mainnet'}.blockfrost.io/api/v0`

    // Add Blockfrost API key validation
    const healthCheck = await fetch(`${blockfrostUrl}/health`, {
      headers: { project_id: blockfrostKey },
    })

    if (!healthCheck.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid Blockfrost API key or network mismatch' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Rate limiting
    const rateLimitKey = `monitor:${address}`
    const current = await kv.get(rateLimitKey)

    if (current?.count >= MONITORING_LIMIT.MAX_REQUESTS) {
      const ttl = await kv.ttl(rateLimitKey)
      return new Response(
        JSON.stringify({
          error: `Monitoring limit exceeded. Try again in ${Math.ceil(ttl / 3600)} hours`,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Get last checked transaction hash
    const lastTxKey = `lastTx:${address}`
    const lastTxHash = await kv.get(lastTxKey)

    // Fetch latest transactions from Blockfrost
    const response = await fetch(`${blockfrostUrl}/addresses/${address}/transactions`, {
      headers: { project_id: blockfrostKey },
    })

    if (!response.ok) {
      throw new Error(`Blockfrost error: ${response.status} ${response.statusText}`)
    }

    const transactions = await response.json()
    const latestTx = transactions[0]

    // Check if new transaction exists
    if (latestTx && latestTx.tx_hash !== lastTxHash) {
      // Send email notification
      await resend.emails.send({
        from: process.env.RESEND_EMAIL_FROM,
        to: process.env.RESEND_EMAIL_TO,
        subject: `New Transaction on Address ${address.slice(0, 8)}...`,
        html: `
          <h2>New Transaction Detected</h2>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Transaction Hash:</strong> ${latestTx.tx_hash}</p>
          <p><strong>Date:</strong> ${new Date(latestTx.block_time * 1000).toLocaleString()}</p>
          <p>View on explorer: 
            <a href="https://cexplorer.io/address/${address}">
              https://cexplorer.io/address/${address}
            </a>
          </p>
        `,
      })

      // Update last transaction hash
      await kv.set(lastTxKey, latestTx.tx_hash)
    }

    // Update rate limit counter
    await kv.set(
      rateLimitKey,
      {
        count: current ? current.count + 1 : 1,
        lastCheck: Date.now(),
      },
      { ex: MONITORING_LIMIT.WINDOW },
    )

    return new Response(
      JSON.stringify({
        success: true,
        message:
          latestTx?.tx_hash === lastTxHash
            ? 'No new transactions'
            : 'New transaction notification sent',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Monitoring error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
