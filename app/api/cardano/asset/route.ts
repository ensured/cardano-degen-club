import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
	try {
		const assetId = req.nextUrl.searchParams.get('assetId')
		console.log('Asset ID:', assetId)
		if (!assetId) {
			return NextResponse.json({ error: 'No asset ID provided' }, { status: 400 })
		}

		const response = await fetch(`https://cardano-preview.blockfrost.io/api/v0/assets/${assetId}`, {
			headers: {
				Accept: 'application/json',
				project_id: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID || '',
			},
		})

		if (!response.ok) {
			const error = await response.text()
			throw new Error(`Blockfrost API error: ${response.status} - ${error}`)
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error: any) {
		console.error('API Route - Error:', error)
		return NextResponse.json({ error: error.message || 'Failed to fetch asset details' }, { status: 500 })
	}
}
