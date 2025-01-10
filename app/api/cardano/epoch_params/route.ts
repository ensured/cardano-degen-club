import { NextResponse } from 'next/server'

export async function GET() {
	//
	// https://api.koios.rest/api/v1/epoch_params
	try {
		const res = await fetch(`https://preview.koios.rest/api/v1/epoch_params`, {
			headers: {
				'Content-Type': 'application/json',
			},
		})

		const data = await res.json()
		console.log('Protocol Params:', data)

		if (!data?.[0]) {
			throw new Error('No protocol parameters returned')
		}

		return NextResponse.json(data[0])
	} catch (error) {
		console.error('Error:', error)
		return NextResponse.json({ error: 'Failed to fetch epoch params' }, { status: 500 })
	}
}
