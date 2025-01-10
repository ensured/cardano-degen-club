import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const address = await req.json()
		console.log('API Route - Received address:', address)

		if (!address) {
			console.error('API Route - No address provided')
			return NextResponse.json({ error: 'No address provided' }, { status: 400 })
		}

		console.log('API Route - Sending request to Koios with address:', address)
		const res = await fetch('https://api.koios.rest/api/v1/address_assets', {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				_addresses: Array.isArray(address) ? address : [address],
			}),
		})

		if (!res.ok) {
			const errorText = await res.text()
			console.error('API Route - Koios API error:', {
				status: res.status,
				statusText: res.statusText,
				body: errorText,
			})
			throw new Error(`Koios API error: ${res.status} - ${errorText}`)
		}

		const data = await res.json()
		console.log('API Route - Successfully fetched address assets:', data)

		return NextResponse.json(data)
	} catch (error: any) {
		console.error('API Route - Error:', error)
		return NextResponse.json({ error: error.message || 'Failed to fetch address assets' }, { status: 500 })
	}
}
