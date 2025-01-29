'use client'

import { useWallet, WalletContextType } from '@/contexts/WalletContext'
import { Check, Loader2, ChevronDown, ArrowUp, Eye, EyeOff, X } from 'lucide-react'
import { Lucid, Blockfrost, LucidEvolution, fromText } from '@lucid-evolution/lucid'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import Link from 'next/link'
type AssetMetadata = {
  name: string
  image?: string
  amount: bigint
  assetId: string
}

const Airdrop = () => {
  const { walletState, loading } = useWallet() as WalletContextType
  const [lucid, setLucid] = useState<LucidEvolution | null>(null)
  const [policyId, setPolicyId] = useState(localStorage.getItem('policyId') || '')
  const [blockfrostKey, setBlockfrostKey] = useState(localStorage.getItem('blockfrostKey') || '')
  const [addresses, setAddresses] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [assets, setAssets] = useState<Record<string, bigint>>({})
  const [assetDetails, setAssetDetails] = useState<Record<string, AssetMetadata>>({})
  const [selectedAsset, setSelectedAsset] = useState<AssetMetadata | null>(null)
  const [amountPerPerson, setAmountPerPerson] = useState('')
  const [isAirdropping, setIsAirdropping] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const [manualAddressesInput, setManualAddressesInput] = useState('')
  const [manualAddresses, setManualAddresses] = useState<string[]>([])
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showBlockfrostKey, setShowBlockfrostKey] = useState(false)
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)

  const networkMap = {
    0: 'Preview',
    1: 'Mainnet',
    2: 'Preprod',
    3: 'Custom',
  }

  //   useEffect(() => {
  //     if (policyId && policyId.length === 56 && lucid) {
  //       handleSearch()
  //     }
  //   }, [policyId, walletState.api, lucid])

  useEffect(() => {
    if (walletState.wallet && walletState.api) {
      const connectLucid = async () => {
        if (!blockfrostKey) {
          setIsLoadingAssets(false)
          return
        }
        setIsLoadingAssets(true)
        try {
          const lucidInstance = await Lucid(
            new Blockfrost(
              `https://cardano-${networkMap[walletState.network! as keyof typeof networkMap].toLowerCase()}.blockfrost.io/api/v0`,
              blockfrostKey,
            ),
            'Preview',
          )
          lucidInstance.selectWallet.fromAPI(walletState.api)
          const utxos = await lucidInstance.utxosAt(walletState.walletAddress!)

          // Calculate assets from UTXOs
          const assetMap: Record<string, bigint> = {}
          utxos.forEach((utxo) => {
            Object.entries(utxo.assets).forEach(([asset, amount]) => {
              assetMap[asset] = (assetMap[asset] || 0n) + amount
            })
          })

          // Fetch metadata for each asset
          const assetDetailsMap: Record<string, AssetMetadata> = {}
          await Promise.all(
            Object.entries(assetMap).map(async ([assetId, amount]) => {
              if (assetId === 'lovelace') {
                assetDetailsMap[assetId] = {
                  name: 'ADA',
                  amount,
                  assetId,
                }
                return
              }

              try {
                const response = await fetch(
                  `https://cardano-${networkMap[walletState.network! as keyof typeof networkMap].toLowerCase()}.blockfrost.io/api/v0/assets/${assetId}`,
                  {
                    headers: {
                      project_id: blockfrostKey,
                    },
                  },
                )
                const metadata = await response.json()

                assetDetailsMap[assetId] = {
                  name: metadata.onchain_metadata?.name || metadata.metadata?.name || 'Unknown',
                  image: metadata.onchain_metadata?.image || metadata.metadata?.image,
                  amount,
                  assetId,
                }
              } catch (error) {
                console.error(`Error fetching metadata for asset ${assetId}:`, error)
                assetDetailsMap[assetId] = {
                  name: 'Unknown',
                  amount,
                  assetId,
                }
              }
            }),
          )

          setAssetDetails(assetDetailsMap)
          setAssets(assetMap)
          setLucid(lucidInstance)
        } catch (error) {
          toast.error('Failed to load assets')
          console.error(error)
        } finally {
          setIsLoadingAssets(false)
        }
      }
      connectLucid()
    } else {
      setIsLoadingAssets(false)
    }
  }, [walletState.api, blockfrostKey])

  const handleSearch = async () => {
    if (!lucid || !policyId) return

    localStorage.setItem('policyId', policyId)

    setIsSearching(true)

    try {
      const blockfrostUrl = `https://cardano-${networkMap[walletState.network! as keyof typeof networkMap].toLowerCase()}.blockfrost.io/api/v0`

      // Get assets by policy ID
      const assetsRes = await fetch(`${blockfrostUrl}/assets/policy/${policyId}`, {
        headers: { project_id: blockfrostKey },
      })
      const assets = await assetsRes.json()

      // Get addresses for each asset
      const addressRequests = assets.map(async (asset: any) => {
        const addressRes = await fetch(`${blockfrostUrl}/assets/${asset.asset}/addresses`, {
          headers: { project_id: blockfrostKey },
        })
        return addressRes.json()
      })

      const addressesResults = await Promise.all(addressRequests)
      const uniqueAddresses = [
        ...new Set(addressesResults.flatMap((result) => result.map((a: any) => a.address))),
      ]

      setAddresses(uniqueAddresses)
    } catch (err) {
      toast.error('Failed to fetch addresses')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAirdrop = async () => {
    if (!selectedAsset) {
      toast.error('Please select an asset')
      return
    }

    if (amountPerPerson === '' || !amountPerPerson) {
      toast.error('Please enter an amount')
      return
    }

    if (!lucid || !policyId) return

    // Convert to per-person amount
    let amountPer = BigInt(amountPerPerson)
    if (selectedAsset.assetId === 'lovelace') {
      amountPer = amountPer * BigInt(1000000) // Convert ADA input to lovelace
    }

    const allAddresses = [...addresses, ...manualAddresses]
    const totalAmount = amountPer * BigInt(allAddresses.length)

    // Check if user has enough of the selected asset
    if (selectedAsset.amount < totalAmount) {
      toast.error(
        `Not enough ${selectedAsset.name} tokens. Need ${totalAmount.toString()} total (${amountPerPerson} * ${allAddresses.length})`,
      )
      return
    }

    setIsAirdropping(true)
    try {
      toast.info('Building transaction...')

      // Start building the transaction
      let tx = lucid.newTx()
      console.log(selectedAsset.assetId)
      if (selectedAsset.assetId === 'lovelace') {
        // Now using proper lovelace amounts
        allAddresses.forEach((address) => {
          tx = tx.pay.ToAddress(address, { lovelace: amountPer })
        })
      } else {
        // Handle other assets with combined payment
        const assetPayload = { [selectedAsset.assetId]: amountPer }
        allAddresses.forEach((address) => {
          tx = tx.pay.ToAddress(address, assetPayload)
        })
      }

      // Complete, sign and submit the transaction
      const completedTx = await tx.complete()
      const signedTx = await completedTx.sign.withWallet().complete()
      const txHash = await signedTx.submit()
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
      toast.success(`Transaction submitted! Hash: ${txHash}`)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsAirdropping(false)
    }
  }

  // Helper function to format IPFS URL
  const formatIpfsUrl = (ipfsUrl: string | undefined) => {
    if (!ipfsUrl) return undefined
    if (ipfsUrl.startsWith('ipfs://')) {
      return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return ipfsUrl
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
        <div className="mb-3 w-full space-y-6">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full justify-between border border-border/40 px-6 py-6 hover:bg-accent/50"
              >
                <div className="flex w-full items-center gap-1">
                  <span className="flex w-full items-center gap-1 text-xl font-semibold">
                    <span>Blockfrost API Key</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {blockfrostKey ? (
                    <Check className="text-green-500/80" />
                  ) : (
                    <X className="text-red-500/80" />
                  )}
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={showBlockfrostKey ? 'text' : 'password'}
                    placeholder="Enter your Blockfrost API key"
                    value={blockfrostKey}
                    onChange={(e) => {
                      setBlockfrostKey(e.target.value)
                      if (e.target.value.length === 39) {
                        localStorage.setItem('blockfrostKey', e.target.value)
                      }
                    }}
                    className="h-12 pr-24 text-base"
                  />
                  <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                    {blockfrostKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setBlockfrostKey('')
                          localStorage.removeItem('blockfrostKey')
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowBlockfrostKey(!showBlockfrostKey)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showBlockfrostKey ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <Link
                  href="https://blockfrost.io/dashboard"
                  target="_blank"
                  className="text-xs text-muted-foreground underline"
                >
                  Need an API key? Get one here
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Header Section */}
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Token Airdropper</h1>
          <p className="text-lg text-muted-foreground">
            Distribute tokens to multiple addresses at once
          </p>
        </div>

        {/* Asset Selection */}
        {isLoadingAssets ? (
          <div className="flex min-h-[100px] w-full items-center justify-center rounded-2xl border border-border bg-card/50 p-6">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading your assets...</span>
            </div>
          </div>
        ) : Object.keys(assetDetails).length > 0 ? (
          <div className="mb-2 rounded-2xl border border-border bg-card/50 shadow-sm backdrop-blur-sm">
            <Collapsible open={isAssetSelectorOpen} onOpenChange={setIsAssetSelectorOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between px-6 py-6 hover:bg-accent/50"
                >
                  <div className="flex items-center gap-1">
                    {selectedAsset && selectedAsset.image && (
                      <img
                        src={formatIpfsUrl(selectedAsset.image)}
                        alt={selectedAsset.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    )}
                    <span className="text-xl font-semibold">
                      {selectedAsset ? (
                        <div className="flex items-center gap-1">
                          <span>Token: </span>
                          <span className="text-lg font-semibold">{selectedAsset.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>Select Token to Airdrop</span>
                          <div className="flex items-center justify-center gap-1">
                            <span className="mt-0.5 text-sm text-muted-foreground">
                              ({Object.keys(assetDetails).length})
                            </span>
                          </div>
                        </div>
                      )}
                    </span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(assetDetails)
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((asset) => (
                      <button
                        key={asset.assetId}
                        onClick={() => {
                          setSelectedAsset(asset)
                          setIsAssetSelectorOpen(false)
                        }}
                        className={`group flex items-start gap-4 rounded-xl border border-primary/50 p-4 transition-all hover:border-primary hover:bg-accent/50 ${
                          selectedAsset?.assetId === asset.assetId
                            ? 'border-primary bg-primary/5'
                            : 'border-muted/30'
                        }`}
                      >
                        {asset.image ? (
                          <img
                            src={formatIpfsUrl(asset.image)}
                            alt={asset.name}
                            className="h-16 w-16 rounded-xl border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-muted">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                        <div className="flex flex-1 flex-col items-start gap-2">
                          <span className="line-clamp-2 text-lg font-semibold text-foreground">
                            {asset.name}
                          </span>
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-sm text-muted-foreground">Balance</span>
                            <span className="font-mono text-base font-medium text-primary">
                              {asset.name === 'ADA'
                                ? (Number(asset.amount) / 1_000_000).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : asset.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>

                <div className="mt-4 select-none">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          className="cursor-pointer"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          isActive={currentPage === 1}
                        />
                      </PaginationItem>

                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            Math.ceil(Object.keys(assetDetails).length / itemsPerPage),
                          ),
                        },
                        (_, i) => {
                          const pageNumber = i + 1
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                className="cursor-pointer"
                                onClick={() => setCurrentPage(pageNumber)}
                                isActive={currentPage === pageNumber}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        },
                      )}

                      {Math.ceil(Object.keys(assetDetails).length / itemsPerPage) > 5 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              className="cursor-pointer"
                              onClick={() =>
                                setCurrentPage(
                                  Math.ceil(Object.keys(assetDetails).length / itemsPerPage),
                                )
                              }
                            >
                              {Math.ceil(Object.keys(assetDetails).length / itemsPerPage)}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          className="cursor-pointer"
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(
                                Math.ceil(Object.keys(assetDetails).length / itemsPerPage),
                                p + 1,
                              ),
                            )
                          }
                          isActive={
                            currentPage ===
                            Math.ceil(Object.keys(assetDetails).length / itemsPerPage)
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : blockfrostKey && blockfrostKey.length === 39 ? (
          <div className="flex min-h-[100px] w-full items-center justify-center rounded-2xl border border-border bg-card/50 p-6">
            <span className="text-sm text-muted-foreground">No assets found in wallet</span>
          </div>
        ) : (
          <div className="flex min-h-[100px] w-full items-center justify-center rounded-2xl border border-border bg-card/50 p-6">
            <span className="text-sm text-muted-foreground">
              Please enter a valid Blockfrost API key
            </span>
          </div>
        )}

        {/* Airdrop Controls */}
        {policyId && lucid && selectedAsset && (
          <div className="flex min-w-[75vw] flex-col gap-2 rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="rounded-xl border border-border bg-accent/50 p-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Selected Token</p>
              <div className="flex items-center gap-3">
                {selectedAsset.image && (
                  <img
                    src={formatIpfsUrl(selectedAsset.image)}
                    alt={selectedAsset.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold">{selectedAsset.name}</h3>
                  <p className="font-mono text-sm text-muted-foreground">
                    Balance:{' '}
                    {selectedAsset.name === 'ADA'
                      ? (Number(selectedAsset.amount) / 1_000_000).toLocaleString(undefined, {
                          minimumFractionDigits: 6,
                          maximumFractionDigits: 6,
                        })
                      : selectedAsset.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                placeholder={`Amount of ${selectedAsset?.name || 'tokens'} per address`}
                value={amountPerPerson}
                onChange={(e) => setAmountPerPerson(e.target.value)}
                className="h-14 text-lg"
              />

              {selectedAsset && amountPerPerson && (
                <div className="rounded-lg border border-border bg-muted/10 p-4">
                  <p className="text-center text-lg">
                    <span className="font-semibold text-primary">{amountPerPerson}</span>{' '}
                    {selectedAsset.name} per address
                    <br />
                    <span className="text-sm text-muted-foreground">
                      (
                      {selectedAsset?.assetId === 'lovelace'
                        ? (
                            Number(
                              BigInt(amountPerPerson || '0') *
                                BigInt(1000000) *
                                BigInt(addresses.length),
                            ) / 1_000_000
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : (
                            BigInt(amountPerPerson || '0') * BigInt(addresses.length)
                          ).toString()}{' '}
                      total)
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Policy ID Section with improved styling */}
            <div className="space-y-4 rounded-xl border border-border bg-accent/50 p-6">
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold">Recipient Addresses</h2>
                <p className="text-sm text-muted-foreground">
                  Enter a policy ID to airdrop to all token holders
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-2">
                <Input
                  placeholder="Enter Policy ID (56 characters)"
                  value={policyId}
                  onChange={(e) => {
                    if (e.target.value.length === 56) {
                      setPolicyId(e.target.value)
                    } else {
                      setPolicyId('')
                      setAddresses([])
                      localStorage.removeItem('policyId')
                    }
                  }}
                  className="h-12 w-full text-base"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={!policyId || isSearching || !lucid}
                    className="h-12 px-6"
                  >
                    {isSearching ? <Loader2 className="size-5 animate-spin" /> : 'Search Addresses'}
                  </Button>
                  {policyId && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPolicyId('')
                        setAddresses([])
                        localStorage.removeItem('policyId')
                      }}
                      className="h-12"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              {/* Addresses Preview */}
              {addresses.length > 0 && (
                <div className="shadow-sm">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="flex w-full justify-between px-2 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-semibold">
                            {addresses.length} holders found
                          </span>
                          <span className="text-muted-foreground">(from policy)</span>
                        </div>
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">#</TableHead>
                            <TableHead>Address</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {addresses.map((addr, index) => (
                            <TableRow key={index} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell className="break-all font-mono text-sm">{addr}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex w-full justify-between px-6 py-4">
                  <span className="text-lg font-semibold">Add Manual Addresses</span>
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 space-y-4">
                  <textarea
                    value={manualAddressesInput}
                    onChange={(e) => {
                      setManualAddressesInput(e.target.value)
                      setManualAddresses(
                        e.target.value
                          .split(/[\n,]+/)
                          .map((addr) => addr.trim())
                          .filter((addr) => addr.length > 0 && addr.startsWith('addr')),
                      )
                    }}
                    placeholder={`Enter addresses separated by commas or new lines\nExample:\naddr1q9x...\naddr1q8y..., addr1q7z...`}
                    className="h-32 w-full rounded-lg border border-border bg-background p-4 font-mono text-sm focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-sm text-muted-foreground">
                    {manualAddresses.length} valid addresses detected
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button
              onClick={handleAirdrop}
              disabled={isAirdropping}
              className={`mt-6 h-16 w-full text-lg font-semibold transition-all duration-500 ${
                isSuccess ? 'bg-green-500 hover:bg-green-600' : ''
              }`}
            >
              {isAirdropping ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Airdrop...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Airdrop Successful!
                </>
              ) : (
                <>
                  <ArrowUp className="mr-2 h-5 w-5" />
                  Airdrop to {addresses.length + manualAddresses.length} Addresses
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Airdrop
