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
    const userTimezone = storedWebhook.timezone
    const addresses = storedWebhook.addresses
    const formattedDate = new Date(created * 1000).toLocaleString('en-US', {
      timeZone: userTimezone,
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

    // check if the addresses have test in them if so append preview to cardanoscan.io
    const txHash = payload[0].tx.hash
    const isPreview = payload[0].outputs[0].address.includes('test') ? 'preview.' : ''

    const emailHtml = `<div style="font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 2rem;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 8px; padding: 2rem; border: 1px solid #2d2d2d;">
    
    <div style="margin-bottom: 1.5rem;">
      <a href="https://${isPreview}cardanoscan.io/transaction/${payload[0].tx.hash}" 
         style="background-color: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500; transition: background-color 0.2s;"
         onmouseover="this.style.backgroundColor='#4338ca'" 
         onmouseout="this.style.backgroundColor='#4f46e5'">
        View on Cardanoscan
      </a>
    </div>

    <div style="background-color: #262626; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
      <div style="display: grid; grid-template-columns: max-content 1fr; gap: 0.75rem; font-size: 0.875rem;">
        <div style="color: #a1a1aa;">Block Height:</div>
        <div style="color: #fafafa;">${payload[0].tx.block_height}</div>
        <div style="color: #a1a1aa;">Timestamp:</div>
        <div style="color: #fafafa;">${formattedDate}</div>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.125rem; color: #e5e7eb; margin-bottom: 0.75rem; font-weight: 500;">Outputs</h2>
      <div style="background-color: #262626; padding: 1rem; border-radius: 6px;">
        ${payload[0].outputs
          .map(
            (output) => `
          <div style="padding: 0.75rem 0; border-bottom: 1px solid #3f3f46; ${addresses.includes(output.address) ? 'background-color: #1e3a1e;' : ''}">
            <div style="font-family: 'SF Mono', Menlo, monospace; color: ${addresses.includes(output.address) ? '#22c55e' : '#4f46e5'}; margin-bottom: 0.25rem;">
              ${formatAddress(output.address)}
              ${addresses.includes(output.address) ? '<span style="margin-left: 8px; background-color: #14532d; color: #86efac; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Your Address</span>' : ''}
            </div>
            <div style="color: #d4d4d8;">
              ${output.amount
                .map((asset) =>
                  asset.unit === 'lovelace'
                    ? `${(parseInt(asset.quantity) / 1000000).toFixed(2)} ADA`
                    : `${asset.quantity} ${asset.unit}`,
                )
                .join(', ')}
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
  </div>
</div>`

    await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM_TXIN,
      to: userEmail,
      subject: 'New Transaction Alert!',
      html: emailHtml,
    })

    return NextResponse.json({ processed: true }, { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ processed: false, error: error.message }, { status: 500 })
  }
}
