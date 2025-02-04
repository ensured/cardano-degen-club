import { kv } from '@vercel/kv'
import { verifyWebhookSignature, SignatureVerificationError } from '@blockfrost/blockfrost-js'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'
import { NextResponse } from 'next/server'
const WEBHOOK_AUTH_TOKEN = process.env.BLOCKFROST_AUTH_TOKEN

export async function POST(request, response) {
  try {
    const signatureHeader = request.headers.get('blockfrost-signature')

    if (!signatureHeader) {
      return NextResponse.json({ error: 'Missing Blockfrost-Signature header' }, { status: 400 })
    }

    const rawBody = await request.text()
    const body = JSON.parse(rawBody)

    // Verify webhook signature
    verifyWebhookSignature(rawBody, signatureHeader, WEBHOOK_AUTH_TOKEN, 600)

    // Process webhook event
    const { type, payload } = body
    switch (type) {
      case 'transaction':
        console.log(`Received ${payload.length} transactions`)
        for (const transaction of payload) {
          console.log(`Transaction ${transaction.tx.hash}`)
          // Store in KV or process further
          await kv.set(`tx:${transaction.tx.hash}`, transaction)
        }
        break

      case 'block':
        console.log(`Received block ${payload.hash}`)
        await kv.set(`block:${payload.hash}`, payload)
        break

      // Add other cases as needed

      default:
        console.warn(`Unhandled event type: ${type}`)
    }

    return NextResponse.json({ processed: true }, { status: 200 })
  } catch (error) {
    if (error instanceof SignatureVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
