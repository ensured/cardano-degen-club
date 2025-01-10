import { NextResponse } from 'next/server'
import { CARDANO_NETWORK } from '@/components/Poas'
// import { Lucid, Blockfrost, fromUnit, scriptFromNative } from '@lucid-evolution/lucid'
interface PolicyInfo {
	policyId: string
	createdAt: number
	slot: number
	script: any
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const address = searchParams.get('address')
	const keyHash = searchParams.get('keyHash')
	const blockfrostKey = searchParams.get('blockfrostKey')
	if (!address || !keyHash || !blockfrostKey) {
		return NextResponse.json({ error: 'Address, keyHash, and blockfrostKey are required' }, { status: 400 })
	}

	try {
		// Get all transactions for the address
		const txResponse = await fetch(
			`https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0/addresses/${address}/transactions?order=desc`,
			{
				headers: {
					project_id: blockfrostKey,
				},
			},
		)

		if (!txResponse.ok) {
			throw new Error('Failed to fetch transactions')
		}

		const transactions = await txResponse.json()

		const policies = new Map<string, PolicyInfo>()

		// For each transaction, first get transaction details to check if it has mints
		for (const tx of transactions) {
			// Get transaction details
			const txDetailsResponse = await fetch(
				`https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0/txs/${tx.tx_hash}`,
				{
					headers: {
						project_id: blockfrostKey,
					},
				},
			)

			if (!txDetailsResponse.ok) {
				console.log('Failed to fetch tx details:', tx.tx_hash, txDetailsResponse.status)
				continue
			}

			const txDetails = await txDetailsResponse.json()
			console.log(txDetails)

			if (txDetails.asset_mint_or_burn_count > 0) {
				for (const output of txDetails.output_amount) {
					if (output.unit !== 'lovelace') {
						const policyId = output.unit.slice(0, 56)

						if (!policies.has(policyId) && policyId.length === 56) {
							const scriptDetailsResponse = await fetch(
								`https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0/scripts/${policyId}/json`,
								{
									headers: {
										project_id: blockfrostKey,
									},
								},
							)
							const scriptDetails = scriptDetailsResponse.ok ? await scriptDetailsResponse.json() : null

							// Check if the keyHash matches before adding to policies
							const keyHashMatches = scriptDetails?.json
								? scriptDetails.json.keyHash
									? scriptDetails.json.keyHash === keyHash
									: scriptDetails.json.scripts?.[0]?.keyHash === keyHash
								: false

							if (scriptDetails?.json && keyHashMatches) {
								policies.set(policyId, {
									policyId,
									createdAt: txDetails.block_time * 1000,
									slot: txDetails.slot,
									script: scriptDetails.json,
								})
							}
						}
					}
				}
			}
		}
		return NextResponse.json({
			policies: Array.from(policies.values()),
			total: policies.size,
		})
	} catch (error) {
		console.error('Error:', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch policies' },
			{ status: 500 },
		)
	}
}
