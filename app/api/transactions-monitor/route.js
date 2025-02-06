import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { created, payload, webhook_id } = await request.json()

    // Validate webhook registration and get stored data
    const storedWebhook = await kv.get(`webhook:${webhook_id}`)
    if (!storedWebhook || storedWebhook.id !== webhook_id) {
      console.error('Invalid webhook ID or unregistered user')
      return NextResponse.json({ processed: false, error: 'Unauthorized webhook' }, { status: 401 })
    }

    // Get the user's email from stored webhook data
    const userEmail = storedWebhook.email

    const formattedDate = new Date(created * 1000).toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    })

    const formatAddress = (address) => {
      return `${address.slice(0, 12)}...${address.slice(-8)}`
    }

    const formattedOutputs = payload[0].outputs
      .map((output) => {
        const amounts = output.amount
          .map((asset) => {
            if (asset.unit === 'lovelace') {
              const ada = (parseInt(asset.quantity) / 1000000).toFixed(2)
              return `${ada} ADA`
            }
            return `${asset.quantity} ${asset.unit}`
          })
          .join(', ')

        const isToMe = output.address === userAddress ? '(ME) ' : ''
        return `${isToMe}${formatAddress(output.address)}: ${amounts}`
      })
      .join('\n')

    // check if the addresses have test in them if so append preview to cardanoscan.io
    const txHash = payload[0].tx.hash
    const isPreview = txHash.includes('test') ? 'preview.' : ''

    const emailText = `New transaction detected!
-----------------------------
Tx: https://${isPreview}cardanoscan.io/transaction/${payload[0].tx.hash}
Block Height:     ${payload[0].tx.block_height}
Timestamp:        ${formattedDate}



Transaction Outputs:
${formattedOutputs}`

    await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM_TXIN,
      to: userEmail, // Use the stored email address
      subject: 'New Transaction!',
      text: emailText,
    })

    return NextResponse.json({ processed: true }, { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ processed: false }, { status: 500 })
  }
}
