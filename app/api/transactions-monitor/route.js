import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { created, payload } = await request.json()

    const userAddress = process.env.USER_ADDRESS
    const formattedDate = new Date(created * 1000).toLocaleString()
    const outputsToUser = payload[0].outputs.filter((output) => output.address === userAddress)

    const formattedAmounts = outputsToUser
      .flatMap((output) =>
        output.amount.map((asset) => {
          if (asset.unit === 'lovelace') {
            const ada = (parseInt(asset.quantity) / 1000000).toFixed(2)
            return `${ada} ADA`
          }
          return `${asset.quantity} ${asset.unit}`
        }),
      )
      .join('\n')

    const emailText = `New transaction detected!
-----------------------------
Transaction Hash: ${payload[0].tx.hash}
Block Height:     ${payload[0].tx.block_height}
Timestamp:        ${formattedDate}

Received Amounts:
${formattedAmounts || 'No assets received'}`

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM_TXIN,
      to: process.env.RESEND_EMAIL_TO,
      subject: 'New Transaction!',
      text: emailText,
    })

    return NextResponse.json({ processed: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
