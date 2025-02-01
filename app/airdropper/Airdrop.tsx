'use client'

import { useWallet, WalletContextType } from '@/contexts/WalletContext'
import { Check, Loader2, ChevronDown, ArrowUp, Eye, EyeOff, X } from 'lucide-react'
import { Lucid, Blockfrost, LucidEvolution, fromText, Network } from '@lucid-evolution/lucid'
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
import Image from 'next/image'
import { getContractAddresses } from '@/app/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { fetchAddressesFromPolicy } from '@/app/actions'

type AssetMetadata = {
  name: string
  image?: string
  amount: bigint
  assetId: string
}

type PolicyAddresses = {
  policyId: string
  addresses: string[]
  label?: string // Optional label for the policy
}

const Airdrop = () => {
  const { walletState, loading } = useWallet() as WalletContextType
  const [lucid, setLucid] = useState<LucidEvolution | null>(null)
  const [policyId, setPolicyId] = useState(localStorage.getItem('policyId') || '')

  const [blockfrostKey, setBlockfrostKey] = useState(localStorage.getItem('blockfrostKey') || '')
  const [isSearching, setIsSearching] = useState(false)
  const [assets, setAssets] = useState<Record<string, bigint>>({})
  const [assetDetails, setAssetDetails] = useState<Record<string, AssetMetadata>>({})
  const [selectedAsset, setSelectedAsset] = useState<AssetMetadata | null>(null)
  const [amountPerPerson, setAmountPerPerson] = useState(1)
  const [isAirdropping, setIsAirdropping] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [manualAddressesInput, setManualAddressesInput] = useState('')
  const [manualAddresses, setManualAddresses] = useState<string[]>([])
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showBlockfrostKey, setShowBlockfrostKey] = useState(false)
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const [policyAddresses, setPolicyAddresses] = useState<PolicyAddresses[]>([])
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set())
  const [isAddressesOpen, setIsAddressesOpen] = useState(false)
  const [openPolicies, setOpenPolicies] = useState<Set<string>>(new Set())
  const itemsPerPage = 20
  const [tempPolicyAddresses, setTempPolicyAddresses] = useState<string[]>([])
  const [selectedTempAddresses, setSelectedTempAddresses] = useState<Set<string>>(new Set())
  const [blacklistedAddresses, setBlacklistedAddresses] = useState<Set<string>>(new Set())
  const [isProcessingAllPages, setIsProcessingAllPages] = useState(false)

  const networkMap = {
    0: 'Preview',
    1: 'Mainnet',
    2: 'Preprod',
    3: 'Custom',
  }

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
            networkMap[walletState.network! as keyof typeof networkMap] as Network,
          )
          lucidInstance.selectWallet.fromAPI(walletState.api)
          const utxos = await lucidInstance.utxosAt(walletState.walletAddress!)

          // Calculate all assets from UTXOs
          const assetMap: Record<string, bigint> = {}
          utxos.forEach((utxo) => {
            Object.entries(utxo.assets).forEach(([asset, amount]) => {
              assetMap[asset] = (assetMap[asset] || 0n) + amount
            })
          })

          // Set full asset map for pagination info
          setAssets(assetMap)

          // Get only the current page assets for metadata fetching
          const startIndex = (currentPage - 1) * itemsPerPage
          const endIndex = startIndex + itemsPerPage
          const currentPageAssets = Object.entries(assetMap).slice(startIndex, endIndex)

          // Fetch metadata only for current page assets
          const assetDetailsMap: Record<string, AssetMetadata> = {}
          await Promise.all(
            currentPageAssets.map(async ([assetId, amount]) => {
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
  }, [walletState.api, blockfrostKey, currentPage])

  useEffect(() => {
    const fetchBlacklistedAddresses = async () => {
      try {
        const { addresses, error } = await getContractAddresses()
        if (error) {
          toast.error('Failed to load contract blacklist')
          return
        }
        setBlacklistedAddresses(new Set(addresses))
      } catch (error) {
        console.error('Error fetching blacklist:', error)
        toast.error('Failed to load contract blacklist')
      }
    }

    fetchBlacklistedAddresses()
  }, [])

  const handleSearch = async () => {
    if (!lucid || !policyId) return

    if (policyAddresses.some((p) => p.policyId === policyId)) {
      toast.error('Policy ID already added')
      return
    }

    localStorage.setItem('policyId', policyId)
    setIsSearching(true)
    setTempPolicyAddresses([])
    setIsProcessingAllPages(true)

    try {
      toast.info('Fetching addresses from policy...')
      const data = await fetchAddressesFromPolicy(policyId)

      if (!data || !Array.isArray(data)) {
        toast.error('Failed to fetch addresses')
        return
      }

      const uniqueAddresses = new Set<string>()
      data.forEach((item: any) => {
        if (item.payment_address) {
          uniqueAddresses.add(item.payment_address)
        }
      })

      const addressArray = Array.from(uniqueAddresses)

      // Add new policy addresses to the list
      setPolicyAddresses((prev) => [
        ...prev,
        {
          policyId,
          addresses: addressArray,
          label: `Policy ${prev.length + 1}`,
        },
      ])

      // Add selected addresses to the global selected set
      setSelectedAddresses((prev) => {
        const newSet = new Set(prev)
        addressArray.forEach((addr) => newSet.add(addr))
        return newSet
      })

      toast.success(`Added ${addressArray.length} addresses to the list`, { duration: 5000 })
    } catch (err) {
      toast.error('Failed to fetch addresses')
      console.error('Error:', err)
    } finally {
      setIsProcessingAllPages(false)
      setIsSearching(false)
    }
  }

  const confirmAddAddresses = () => {
    if (selectedTempAddresses.size === 0) {
      toast.error('No addresses selected')
      return
    }

    // Filter out blacklisted addresses
    const filteredAddresses = Array.from(selectedTempAddresses).filter(
      (address) => !blacklistedAddresses.has(address),
    )

    if (filteredAddresses.length === 0) {
      toast.error('All selected addresses are blacklisted')
      return
    }

    // Add new policy addresses to the list
    setPolicyAddresses((prev) => [
      ...prev,
      {
        policyId,
        addresses: filteredAddresses,
        label: `Policy ${prev.length + 1}`,
      },
    ])

    // Add selected addresses to the global selected set
    setSelectedAddresses((prev) => {
      const newSet = new Set(prev)
      filteredAddresses.forEach((addr) => newSet.add(addr))
      return newSet
    })

    // Clear temporary addresses
    setTempPolicyAddresses([])
    setSelectedTempAddresses(new Set())
    toast.success(`Added ${filteredAddresses.length} addresses`)
  }

  const handleSelectAllTemp = (select: boolean) => {
    if (select) {
      setSelectedTempAddresses(new Set(tempPolicyAddresses))
    } else {
      setSelectedTempAddresses(new Set())
    }
  }

  const removeAddress = (address: string) => {
    setSelectedAddresses((prev) => {
      const newSet = new Set(prev)
      newSet.delete(address)
      return newSet
    })
  }

  const removePolicy = (policyId: string) => {
    setPolicyAddresses((prev) => prev.filter((p) => p.policyId !== policyId))
    // Remove all addresses associated with this policy
    const addressesToRemove = policyAddresses.find((p) => p.policyId === policyId)?.addresses || []
    setSelectedAddresses((prev) => {
      const newSet = new Set(prev)
      addressesToRemove.forEach((addr) => newSet.delete(addr))
      return newSet
    })
  }

  const handleAirdrop = async () => {
    if (!lucid) return

    if (!selectedAsset) {
      toast.error('Please select an asset')
      return
    }

    if (amountPerPerson === 0 || !amountPerPerson) {
      toast.error('Please enter an amount')
      return
    }

    // Convert to per-person amount
    let amountPer = BigInt(amountPerPerson)
    if (selectedAsset.assetId === 'lovelace') {
      amountPer = amountPer * BigInt(1000000) // Convert ADA input to lovelace
    }

    // Get all addresses before filtering
    const totalAddressesBeforeFilter = [...selectedAddresses, ...manualAddresses].length

    // Filter out blacklisted addresses
    const allAddresses = [...selectedAddresses, ...manualAddresses].filter(
      (addr) => !blacklistedAddresses.has(addr),
    )

    // Calculate how many were excluded
    const excludedCount = totalAddressesBeforeFilter - allAddresses.length

    if (allAddresses.length === 0) {
      toast.error('No valid addresses to send to after filtering blacklisted addresses')
      return
    }

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
      toast.info(
        `Building transaction for ${allAddresses.length} addresses (${excludedCount} blacklisted addresses excluded)...`,
      )

      // Start building the transaction
      let tx = lucid.newTx()
      let x = await lucid.utxosAtWithUnit(walletState.walletAddress!, selectedAsset.assetId)
      console.log(x)

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
    if (typeof ipfsUrl !== 'string') return undefined
    if (ipfsUrl.startsWith('ipfs://')) {
      return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return ipfsUrl
  }

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="w-full rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
        <h1 className="p-2 text-center text-sm text-muted-foreground">
          Use at your own risk. This is a beta version and may not work as expected. Always verify.
        </h1>
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
          <div className="mb-2 min-w-[75vw] rounded-2xl border border-border bg-card/50 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-1.5 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-4 rounded-xl border border-muted/30 p-4 hover:border-primary hover:bg-accent/50"
                >
                  <div className="flex h-16 w-16 shrink-0 animate-pulse rounded-xl border border-border bg-muted">
                    <span className="m-auto text-xs text-muted-foreground">No image</span>
                  </div>
                  <div className="flex flex-1 flex-col items-start gap-2">
                    <span className="h-[28px] w-3/4 animate-pulse rounded-md bg-muted" />
                    <div className="flex flex-col items-start gap-1">
                      <span className="h-5 w-16 animate-pulse rounded-md bg-muted" />
                      <span className="h-6 w-24 animate-pulse rounded-md bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
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
                      <Image
                        src={formatIpfsUrl(selectedAsset.image) || ''}
                        width={32}
                        height={32}
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
                          <span>Select Token</span>
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
                  {Object.entries(assets)
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map(([assetId, amount]) => {
                      const metadata = assetDetails[assetId]
                      return (
                        <button
                          key={assetId}
                          onClick={() => {
                            setSelectedAsset(
                              metadata || {
                                name: assetId === 'lovelace' ? 'ADA' : 'Unknown',
                                amount,
                                assetId,
                              },
                            )
                            setIsAssetSelectorOpen(false)
                          }}
                          className={`group flex items-start gap-4 rounded-xl border border-primary/50 p-4 transition-all hover:border-primary hover:bg-accent/50 ${
                            selectedAsset?.assetId === assetId
                              ? 'border-primary bg-primary/5'
                              : 'border-muted/30'
                          }`}
                        >
                          {metadata?.image ? (
                            <img
                              src={formatIpfsUrl(metadata.image)}
                              alt={metadata.name}
                              className="h-16 w-16 rounded-xl border border-border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-muted">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                          <div className="flex flex-1 flex-col items-start gap-2">
                            <span className="line-clamp-2 text-lg font-semibold text-foreground">
                              {metadata?.name || (assetId === 'lovelace' ? 'ADA' : 'Loading...')}
                            </span>
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-sm text-muted-foreground">Balance</span>
                              <span className="font-mono text-base font-medium text-primary">
                                {assetId === 'lovelace'
                                  ? (Number(amount) / 1_000_000).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
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
                          length: Math.min(5, Math.ceil(Object.keys(assets).length / itemsPerPage)),
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

                      {Math.ceil(Object.keys(assets).length / itemsPerPage) > 5 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              className="cursor-pointer"
                              onClick={() =>
                                setCurrentPage(Math.ceil(Object.keys(assets).length / itemsPerPage))
                              }
                            >
                              {Math.ceil(Object.keys(assets).length / itemsPerPage)}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          className="cursor-pointer"
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(Math.ceil(Object.keys(assets).length / itemsPerPage), p + 1),
                            )
                          }
                          isActive={
                            currentPage === Math.ceil(Object.keys(assets).length / itemsPerPage)
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
        {lucid && selectedAsset && (
          <div className="flex min-w-[75vw] flex-col gap-2 p-6 shadow-sm backdrop-blur-sm">
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
                onChange={(e) => setAmountPerPerson(Number(e.target.value))}
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
                      {selectedAsset?.assetId === 'lovelace' && Number(amountPerPerson) > 0
                        ? (
                            Number(
                              BigInt(amountPerPerson || '0') *
                                BigInt(1000000) *
                                BigInt(selectedAddresses.size),
                            ) / 1_000_000
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : (
                            BigInt(amountPerPerson || '0') * BigInt(selectedAddresses.size)
                          ).toString()}{' '}
                      total)
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Policy ID and Addresses Section */}
            <div className="space-y-4 rounded-xl border border-border bg-accent/50 p-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Recipient Addresses</h2>
                <p className="text-sm text-muted-foreground">
                  Add addresses from multiple Policy IDs
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
                <Input
                  placeholder="Enter Policy ID (56 characters)"
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  className="h-12 w-full text-base"
                />
                <div className="flex w-full gap-2 sm:w-auto">
                  <Button
                    onClick={handleSearch}
                    disabled={!policyId || isSearching || !lucid || isProcessingAllPages}
                    className="h-12 w-full whitespace-nowrap sm:w-auto"
                  >
                    {isSearching ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : isProcessingAllPages ? (
                      'Processing All Pages...'
                    ) : (
                      'Add Policy'
                    )}
                  </Button>
                </div>
              </div>

              {/* Policy List */}
              <div className="min-w-[75vw]">
                <Collapsible open={isAddressesOpen} onOpenChange={setIsAddressesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="flex w-full justify-between px-4 py-4">
                      <span className="text-lg font-semibold">
                        {selectedAddresses.size} Selected Addresses from {policyAddresses.length}{' '}
                        Policies
                      </span>
                      <ChevronDown className="ml-2 h-5 w-5 shrink-0" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full">
                    <div className="mt-4 space-y-4">
                      {policyAddresses.map((policy) => (
                        <Collapsible
                          key={policy.policyId}
                          open={openPolicies.has(policy.policyId)}
                          onOpenChange={(open) => {
                            setOpenPolicies((prev) => {
                              const newSet = new Set(prev)
                              if (open) {
                                newSet.add(policy.policyId)
                              } else {
                                newSet.delete(policy.policyId)
                              }
                              return newSet
                            })
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold">{policy.label}</h3>
                                <p className="break-all font-mono text-sm text-muted-foreground">
                                  {policy.policyId}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {policy.addresses.length} holders
                                </p>
                              </div>
                              <div className="ml-2 flex shrink-0 items-center gap-2">
                                <Button
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation() // Prevent collapsible from toggling
                                    removePolicy(policy.policyId)
                                  }}
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                                <ChevronDown
                                  className={`h-5 w-5 transition-transform duration-200 ${
                                    openPolicies.has(policy.policyId) ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="w-full">
                            <div className="mt-2 overflow-x-auto rounded-lg border border-border p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[50px] whitespace-nowrap">
                                      Include
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap">Address</TableHead>
                                    <TableHead className="w-[100px] whitespace-nowrap">
                                      Action
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {policy.addresses.map((addr) => (
                                    <TableRow key={addr}>
                                      <TableCell className="whitespace-nowrap">
                                        <input
                                          type="checkbox"
                                          checked={selectedAddresses.has(addr)}
                                          onChange={(e) => {
                                            setSelectedAddresses((prev) => {
                                              const newSet = new Set(prev)
                                              if (e.target.checked) {
                                                newSet.add(addr)
                                              } else {
                                                newSet.delete(addr)
                                              }
                                              return newSet
                                            })
                                          }}
                                          className="h-4 w-4 rounded border-border"
                                        />
                                      </TableCell>
                                      <TableCell className="max-w-[200px] break-all font-mono text-sm sm:max-w-none">
                                        {addr}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeAddress(addr)}
                                          className="h-8 px-2 text-destructive hover:text-destructive"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
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
                  Airdrop to {selectedAddresses.size + manualAddresses.length} Addresses
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
