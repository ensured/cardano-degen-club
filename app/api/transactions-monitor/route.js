import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { type, payload } = await request.json()

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM_TXIN,
      to: process.env.RESEND_EMAIL_TO,
      subject: 'New Transaction!',
      text: `New transaction:\n${JSON.stringify(payload, null, 2)}`,
    })

    return NextResponse.json({ processed: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
