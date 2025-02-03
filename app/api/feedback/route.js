import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { feedback } = await request.json()

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM,
      to: process.env.RESEND_EMAIL_TO,
      subject: 'New Feedback!',
      text: `${feedback}`,
    })

    if (error) {
      console.error('Resend error:', error)
      return new Response(JSON.stringify({ success: false, error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('Email sent:', data)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Server error:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
