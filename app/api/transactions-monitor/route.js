import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { created, payload } = await request.json()

    const formattedDate = new Date(created * 1000).toLocaleString()

    // Remove address filtering and process all assets
    const allAssets = payload[0].outputs.flatMap((output) => output.amount)

    // Sum quantities for each asset unit
    const assetMap = allAssets.reduce((acc, asset) => {
      acc[asset.unit] = (acc[asset.unit] || 0) + parseInt(asset.quantity)
      return acc
    }, {})

    // Format the summed assets
    const formattedAmounts = Object.entries(assetMap)
      .map(([unit, quantity]) => {
        if (unit === 'lovelace') {
          const ada = (quantity / 1000000).toFixed(2)
          return `${ada} ADA`
        }
        return `${quantity} ${unit}`
      })
      .join('\n')

    const emailText = `New transaction detected!
-----------------------------
Transaction Hash: ${payload[0].tx.hash}
Block Height:     ${payload[0].tx.block_height}
Timestamp:        ${formattedDate}

Transaction Totals:
${formattedAmounts || 'No assets detected'}`

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
