import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
	try {
		const formData = await req.formData()
		const file = formData.get('file') as File

		// Create new FormData for Pinata
		const pinataFormData = new FormData()
		pinataFormData.append('file', file) // No need to convert to buffer, just pass the File directly

		// Add optional metadata
		const pinataMetadata = JSON.stringify({
			name: file.name,
		})
		pinataFormData.append('pinataMetadata', pinataMetadata)

		const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
			method: 'POST',
			headers: {
				Authorization: req.headers.get('Authorization') || '',
			},
			body: pinataFormData,
		})

		const result = await pinataResponse.json()
		return NextResponse.json(result)
	} catch (error) {
		console.error('Error uploading to IPFS:', error)
		return NextResponse.json({ error: 'Failed to upload to IPFS' }, { status: 500 })
	}
}
