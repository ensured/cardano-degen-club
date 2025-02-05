'use client'

import { useWallet, WalletContextType } from '@/contexts/WalletContext'
import { Check, Loader2, ChevronDown, ArrowUp, Eye, EyeOff, X, Copy } from 'lucide-react'
import { Lucid, Blockfrost, LucidEvolution, fromText, Network } from '@lucid-evolution/lucid'
import { useEffect, useState, useMemo } from 'react'
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

import { fetchAddressesFromPolicy } from '@/app/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Skeleton } from '@/components/ui/skeleton'
import { useDropzone } from 'react-dropzone'

type AssetMetadata = {
  name: string
  image?: string
  amount: bigint
  assetId: string
}

type PolicyAddresses = {
  policyId: string
  addresses: { address: string; selected: boolean }[]
  label?: string
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
  const itemsPerPage = 20
  const [blacklistedAddresses, setBlacklistedAddresses] = useState<Set<string>>(new Set())
  const [isProcessingAllPages, setIsProcessingAllPages] = useState(false)
  const [duplicates, setDuplicates] = useState<Set<string>>(new Set())
  const [duplicatesDialogOpen, setDuplicatesDialogOpen] = useState(false)

  const networkMap = {
    0: 'Preview',
    1: 'Mainnet',
    2: 'Preprod',
    3: 'Custom',
  }

  const selectedAddresses = useMemo(() => {
    const addresses = new Set<string>()
    policyAddresses.forEach((policy) => {
      policy.addresses
        .filter((addr) => addr.selected)
        .forEach((addr) => addresses.add(addr.address))
    })
    return addresses
  }, [policyAddresses])

  useEffect(() => {
    if (walletState.wallet && walletState.api) {
      const connectLucid = async () => {
        if (!blockfrostKey || blockfrostKey.length !== 39) {
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
          let message = ''
          if (
            blockfrostKey.startsWith(
              networkMap[walletState.network! as keyof typeof networkMap].toLowerCase(),
            )
          ) {
            message = 'Something went wrong, check blockfrost key'
          } else {
            message =
              'invalid network, check that the blockfrost key matches the network of your wallet'
          }
          toast.error(message)
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
    setIsProcessingAllPages(true)

    try {
      toast.info('Fetching addresses from policy...')
      const data = await fetchAddressesFromPolicy(
        policyId,
        networkMap[walletState.network! as keyof typeof networkMap].toLowerCase(),
      )

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

      // Add new policy addresses with selected status
      setPolicyAddresses((prev) => [
        ...prev,
        {
          policyId,
          addresses: addressArray.map((addr) => ({
            address: addr,
            selected: true, // Default to selected when added
          })),
          label: `Policy ${prev.length + 1}`,
        },
      ])

      toast.success(`Added ${addressArray.length} addresses to the list`)
    } catch (err) {
      toast.error('Failed to fetch addresses')
      console.error('Error:', err)
    } finally {
      setIsProcessingAllPages(false)
      setIsSearching(false)
    }
  }

  const removeAddress = (address: string, policyId: string) => {
    setPolicyAddresses((prev) => {
      return prev
        .map((policy) => {
          if (policy.policyId === policyId) {
            return {
              ...policy,
              addresses: policy.addresses.filter((addr) => addr.address !== address),
            }
          }
          return policy
        })
        .filter((policy) => policy.addresses.length > 0)
    })
  }

  const removePolicy = (policyId: string) => {
    setPolicyAddresses((prev) => prev.filter((p) => p.policyId !== policyId))
  }

  const handleAirdrop = async () => {
    if (!lucid) return
    setIsAirdropping(true)
    setIsSuccess(false)

    if (!selectedAsset) {
      toast.error('Please select an asset')
      setIsAirdropping(false)
      return
    }

    if (amountPerPerson === 0 || !amountPerPerson) {
      toast.error('Please enter an amount')
      setIsAirdropping(false)
      return
    }

    try {
      let amountPer: bigint

      if (selectedAsset.assetId === 'lovelace') {
        // For ADA, multiply by 1_000_000 to convert to lovelace
        amountPer = BigInt(Math.round(Number(amountPerPerson) * 1_000_000))
      } else {
        // For other tokens, convert to integer
        amountPer = BigInt(Math.round(Number(amountPerPerson)))
      }

      // Get all addresses before filtering
      const totalAddressesBeforeFilter = [...selectedAddresses, ...manualAddresses].length

      // Filter out blacklisted addresses
      const allAddresses = [...selectedAddresses, ...manualAddresses].filter(
        (addr) => !blacklistedAddresses.has(addr),
      )

      // Calculate how many were excluded
      const excludedCount = totalAddressesBeforeFilter - allAddresses.length
      if (excludedCount > 0) {
        toast.info(`Excluded ${excludedCount} blacklisted addresses`)
      }

      if (allAddresses.length === 0) {
        toast.error('No valid addresses to send to after filtering blacklisted addresses')
        setIsAirdropping(false)
        return
      }

      let lastTxHash = ''
      // Find optimal batch size using binary search
      let low = 1
      let high = allAddresses.length
      let optimalBatchSize = 0
      let testTx: any = null

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        const batchAmount = amountPer * BigInt(mid)

        if (selectedAsset.amount < batchAmount) {
          high = mid - 1
          continue
        }

        try {
          let tx = lucid.newTx()
          const currentBatch = allAddresses.slice(0, mid)

          if (selectedAsset.assetId === 'lovelace') {
            currentBatch.forEach((address) => {
              tx = tx.pay.ToAddress(address, { lovelace: amountPer })
            })
          } else {
            const assetPayload = { [selectedAsset.assetId]: amountPer }
            currentBatch.forEach((address) => {
              tx = tx.pay.ToAddress(address, assetPayload)
            })
          }

          testTx = await tx.complete()
          optimalBatchSize = mid
          low = mid + 1
        } catch (error) {
          console.error('Error in binary search:', error)
          high = mid - 1
        }
      }

      // Process in optimal batches
      let processed = 0
      while (processed < allAddresses.length) {
        const batch = allAddresses.slice(processed, processed + optimalBatchSize)

        // Build and send each batch
        let tx = lucid.newTx()
        batch.forEach((address) => {
          if (selectedAsset.assetId === 'lovelace') {
            tx = tx.pay.ToAddress(address, { lovelace: amountPer })
          } else {
            const assetPayload = { [selectedAsset.assetId]: amountPer }
            tx = tx.pay.ToAddress(address, assetPayload)
          }
        })

        const completedTx = await tx.complete()
        const signedTx = await completedTx.sign.withWallet().complete()
        const txHash = await signedTx.submit()
        lastTxHash = txHash // Store the last successful hash
        processed += batch.length
        toast.success(
          `Batch sent to ${batch.length} addresses (${processed}/${allAddresses.length})`,
        )
      }

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
      toast.success(`All batches submitted! Final hash: ${lastTxHash}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error occurred')
      setIsAirdropping(false)
      return
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

  // Add this effect to handle token type changes
  useEffect(() => {
    if (selectedAsset && selectedAsset.assetId !== 'lovelace' && amountPerPerson % 1 !== 0) {
      const roundedAmount = Math.round(amountPerPerson)
      setAmountPerPerson(roundedAmount)
      toast.info(`Amount adjusted to ${roundedAmount}. Native tokens only support whole numbers.`, {
        duration: 4000,
      })
    }
  }, [selectedAsset])

  const handleManualInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setManualAddressesInput(newValue)

    // If textarea is empty, clear everything
    if (!newValue.trim()) {
      setManualAddresses([])
      setDuplicates(new Set())
      return
    }

    // Process the entire input as new
    const result = processAddresses(newValue)
    setManualAddresses(result.validAddresses)
    setDuplicates(result.duplicates)
  }

  const processAddresses = (input: string) => {
    const cleanInput = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')

    const allLines = cleanInput
      .split(/[\n,]+/)
      .map((line) =>
        line
          .trim()
          .replace(/^["'](.*)["']$/, '$1')
          .split(',')[0]
          .trim(),
      )
      .filter(
        (line) =>
          line &&
          (line.toLowerCase().startsWith('addr_test1') || line.toLowerCase().startsWith('addr1')),
      )

    const seen = new Set<string>()
    const newDuplicates = new Set<string>()
    const validAddresses: string[] = []

    allLines.forEach((addr) => {
      if (!addr) return
      if (/^(addr1|addr_test1)[ac-hj-np-z0-9]{50,}$/.test(addr)) {
        if (seen.has(addr)) {
          newDuplicates.add(addr)
        } else {
          seen.add(addr)
          validAddresses.push(addr)
        }
      }
    })

    return { validAddresses, duplicates: newDuplicates }
  }

  const handleAddressFileUpload = async (file: File) => {
    const text = await file.text()
    const { validAddresses, duplicates } = processAddresses(text)
    setManualAddressesInput(validAddresses.join('\n'))
    setManualAddresses(validAddresses)
    setDuplicates(duplicates)
  }

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: {
      'text/*': ['.txt', '.csv'],
    },
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        handleAddressFileUpload(acceptedFiles[0])
      }
    },
  })

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 p-4">
      {/* Header Section */}
      <div className="mb-0.5 space-y-1.5 text-center">
        <h1 className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          Token Airdropper
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
          Distribute tokens to multiple addresses at once
        </p>
      </div>

      <div className="w-full max-w-[98vw] rounded-lg border border-border/40 bg-accent/20 p-4 shadow-[0_0_40px_-15px_rgba(124,58,237,0.3)] transition-all sm:max-w-[500px] md:max-w-[800px] lg:max-w-[1000px]">
        <div className="mb-3 w-full space-y-6">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full justify-between rounded-lg border border-border px-6 py-6 shadow-sm data-[state=open]:rounded-b-none hover:border-border hover:bg-accent/50 hover:backdrop-blur-sm"
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
                  className="h-12 rounded-b-lg rounded-t-none border-x-0 border-b border-l border-r border-t-0 border-border/50 pr-[9.4rem] text-base"
                />
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(blockfrostKey)
                      toast.success('Copied to clipboard')
                    }}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>

                  {blockfrostKey && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm API Key Removal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove the Blockfrost API key? This will
                            disconnect from Blockfrost services and clear any cached data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                              setBlockfrostKey('')
                              localStorage.removeItem('blockfrostKey')
                            }}
                          >
                            Confirm Removal
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBlockfrostKey(!showBlockfrostKey)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showBlockfrostKey ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Link
                href="https://blockfrost.io/dashboard"
                target="_blank"
                className="text-xs text-muted-foreground underline"
              >
                Need an API key? Get one here
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Asset Selection */}
        {isLoadingAssets ? (
          <div className="mb-2 rounded-lg border border-border bg-card/50 shadow-sm backdrop-blur-sm">
            <div className="flex h-12 w-full items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Scanning wallet assets...</span>
            </div>
          </div>
        ) : Object.keys(assetDetails).length > 0 ? (
          <div className="mb-2 rounded-lg border border-border bg-card/50 shadow-sm backdrop-blur-sm">
            <Collapsible open={isAssetSelectorOpen} onOpenChange={setIsAssetSelectorOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="group flex w-full justify-between rounded-lg border-border/20 px-6 py-6 data-[state=open]:rounded-b-none data-[state=open]:border-b-0 hover:border-primary/50 hover:bg-accent/50"
                >
                  <div className="flex w-full items-center gap-3">
                    {selectedAsset ? (
                      <>
                        {selectedAsset.image && (
                          <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-border">
                            <Image
                              src={formatIpfsUrl(selectedAsset.image) || ''}
                              fill
                              alt={selectedAsset.name}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="text-left">
                          <span className="text-lg font-semibold">{selectedAsset.name}</span>
                          <p className="text-sm text-muted-foreground">
                            Balance:{' '}
                            {selectedAsset.assetId === 'lovelace'
                              ? (Number(selectedAsset.amount) / 1_000_000).toLocaleString() + ' ADA'
                              : selectedAsset.amount.toLocaleString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-start">
                        <span className="text-lg font-medium">Select Token</span>
                        <span className="text-sm text-muted-foreground">
                          {Object.keys(assets).length} assets available
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    {selectedAsset && <Check className="text-green-500/80" />}
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </div>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="border-t border-border px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
                          className={`group flex items-start gap-4 rounded-lg border !border-border p-4 transition-all hover:!border-green-300 hover:!bg-green-300/20 dark:hover:!bg-green-300/10 ${
                            selectedAsset?.assetId === assetId &&
                            '!border-green-400 bg-green-300/20'
                          }`}
                        >
                          {metadata?.image ? (
                            <img
                              src={formatIpfsUrl(metadata.image)}
                              alt={metadata.name}
                              className="h-16 w-16 rounded-md border border-border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-muted">
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
          <div className="flex min-h-[100px] w-full items-center justify-center rounded-lg border border-border bg-card/50 p-6">
            <span className="text-sm text-muted-foreground">No assets found in wallet</span>
          </div>
        ) : (
          <div className="flex min-h-[100px] w-full items-center justify-center rounded-lg border border-border bg-card/50 p-6">
            <span className="text-sm text-muted-foreground">
              Please enter a valid Blockfrost API key
            </span>
          </div>
        )}

        {/* Airdrop Controls */}
        {lucid && selectedAsset && (
          <div className="flex flex-col gap-2 shadow-sm backdrop-blur-sm">
            {/* <div className="rounded-lg border border-border bg-accent/50 p-4">
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
            </div> */}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Amount per address {selectedAsset?.assetId === 'lovelace' && '(in ADA)'}
                </label>
                <Input
                  type="number"
                  step={selectedAsset?.assetId === 'lovelace' ? '0.00001' : '1'}
                  min="1"
                  value={Number.isNaN(amountPerPerson) ? '' : amountPerPerson}
                  onChange={(e) => {
                    const inputValue = e.target.value
                    if (inputValue === '') {
                      setAmountPerPerson(1) // Default to 1 when empty
                    } else {
                      const value = parseFloat(inputValue)
                      if (value < 1) {
                        setAmountPerPerson(1)
                      } else if (selectedAsset?.assetId !== 'lovelace') {
                        setAmountPerPerson(Math.round(value))
                      } else {
                        setAmountPerPerson(value)
                      }
                    }
                  }}
                  className="h-14 text-lg focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </div>

              {selectedAsset && amountPerPerson && (
                <div className="rounded-lg border border-border bg-muted/10 p-4">
                  <p className="text-center text-lg">
                    <span className="font-semibold text-primary">{amountPerPerson}</span>{' '}
                    {selectedAsset.name} per address
                    <br />
                    <span className="text-sm text-muted-foreground">
                      (
                      {selectedAsset?.assetId === 'lovelace' && Number(amountPerPerson) > 0
                        ? (Number(amountPerPerson) * selectedAddresses.size).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 5,
                            },
                          )
                        : (Number(amountPerPerson) * selectedAddresses.size).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 5,
                            },
                          )}{' '}
                      total)
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Policy ID and Addresses Section */}
            <div className="space-y-4 rounded-lg border border-border bg-accent/50 p-6">
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

              {policyAddresses.map((policy) => (
                <div key={policy.policyId} className="mt-2">
                  <div className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="min-w-0 flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{policy.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              {policy.addresses.length} holders
                            </p>
                          </div>

                          <p className="break-all font-mono text-sm text-muted-foreground">
                            {policy.policyId}
                          </p>
                        </div>
                      </DialogTrigger>

                      <DialogContent className="fixed left-[50%] top-[50%] z-50 grid max-h-[98vh] w-full max-w-[98vw] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                        <DialogHeader>
                          <VisuallyHidden asChild>
                            <DialogTitle>{policy.label} Addresses</DialogTitle>
                          </VisuallyHidden>
                        </DialogHeader>
                        <Table className="compact-table">
                          <TableHeader className="[&_tr]:h-8">
                            <TableRow>
                              <TableHead className="w-[40px] px-2">Include</TableHead>
                              <TableHead className="px-2">Address</TableHead>
                              <TableHead className="w-[80px] px-2">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="max-h-[50vh] overflow-auto [&_tr]:h-10">
                            {policy.addresses.map((addr) => (
                              <TableRow key={addr.address} className="group">
                                <TableCell className="px-2 py-1">
                                  <input
                                    type="checkbox"
                                    checked={addr.selected}
                                    onChange={(e) => {
                                      setPolicyAddresses((prev) =>
                                        prev.map((p) => {
                                          if (p.policyId === policy.policyId) {
                                            return {
                                              ...p,
                                              addresses: p.addresses.map((a) =>
                                                a.address === addr.address
                                                  ? { ...a, selected: e.target.checked }
                                                  : a,
                                              ),
                                            }
                                          }
                                          return p
                                        }),
                                      )
                                    }}
                                    className="h-4 w-4 rounded border-border"
                                  />
                                </TableCell>
                                <TableCell className="max-w-[600px] px-2 py-1 text-xs font-medium text-muted-foreground">
                                  {!addr.address.startsWith('addr_test') ? (
                                    <Link
                                      href={`https://pool.pm/${addr.address}`}
                                      target="_blank"
                                      className="break-all font-mono hover:underline"
                                    >
                                      <span className="break-all font-mono">{addr.address}</span>
                                    </Link>
                                  ) : (
                                    <span className="break-all font-mono">{addr.address}</span>
                                  )}
                                </TableCell>
                                <TableCell className="px-2 py-1">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2 text-destructive hover:text-destructive"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Address Removal</AlertDialogTitle>
                                        <AlertDialogDescription className="font-mono">
                                          Are you sure you want to remove address:{' '}
                                          {addr.address.slice(0, 24)}...?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive hover:bg-destructive/90"
                                          onClick={() =>
                                            removeAddress(addr.address, policy.policyId)
                                          }
                                        >
                                          Confirm Removal
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </DialogContent>
                    </Dialog>

                    <div className="ml-2 flex shrink-0 items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-transparent text-destructive hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Policy Removal</AlertDialogTitle>
                            <AlertDialogDescription className="font-mono">
                              Are you sure you want to remove {policy.label}?
                              <br />
                              This will delete {policy.addresses.length} addresses from the
                              distribution list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => removePolicy(policy.policyId)}
                            >
                              Confirm Policy Removal
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
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
                  <div
                    {...getRootProps()}
                    className={`relative rounded-lg border-2 ${
                      isDragActive ? 'border-dashed border-primary bg-primary/10' : 'border-border'
                    } transition-colors`}
                  >
                    <input {...getInputProps()} />
                    <textarea
                      value={manualAddressesInput}
                      onChange={handleManualInputChange}
                      placeholder={`Drag & drop file or paste addresses here (comma/newline separated)\nExample:\naddr1q9x...\naddr1q8y..., addr1q7z...`}
                      className="h-44 w-full cursor-auto bg-transparent p-4 font-mono text-sm focus:outline-none"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setManualAddressesInput('')
                          setManualAddresses([])
                          setDuplicates(new Set())
                        }}
                        className="h-8 bg-background/95 text-destructive hover:border-destructive/50 hover:bg-background hover:text-destructive/80"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="text-sm font-medium">
                          Valid: <span className="text-green-500">{manualAddresses.length}</span>
                        </span>
                        {duplicates.size > 0 && (
                          <span className="text-sm font-medium text-yellow-600">
                            Duplicates: {duplicates.size}
                          </span>
                        )}
                        <span className="text-sm font-medium text-destructive">
                          Invalid:{' '}
                          {
                            manualAddressesInput.split(/[\n,]+/).filter((addr) => {
                              const trimmed = addr.trim()
                              return (
                                trimmed.length > 0 &&
                                !/^(addr1|addr_test1)[ac-hj-np-z0-9]+$/.test(trimmed)
                              )
                            }).length
                          }
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          open()
                        }}
                      >
                        Upload CSV/TXT
                      </Button>
                    </div>

                    {duplicates.size > 0 && (
                      <div className="space-y-2">
                        <div className="rounded-lg bg-yellow-500/10 p-3">
                          <p className="text-sm text-yellow-600">
                            Found {duplicates.size} duplicates -{' '}
                            <Button
                              variant="link"
                              className="h-auto p-0 text-yellow-600"
                              onClick={() => setDuplicatesDialogOpen(true)}
                            >
                              View All Duplicates
                            </Button>
                          </p>
                        </div>

                        <Dialog open={duplicatesDialogOpen} onOpenChange={setDuplicatesDialogOpen}>
                          <DialogContent className="fixed left-[50%] top-[50%] z-50 grid max-h-[98vh] w-full max-w-[98vw] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                            <DialogHeader>
                              <DialogTitle>Duplicate Addresses</DialogTitle>
                              <p className="text-sm text-muted-foreground">
                                These addresses appeared multiple times in your input and will only
                                be sent to once
                              </p>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="rounded-md border p-4">
                                {Array.from(duplicates)
                                  .slice(
                                    (currentPage - 1) * itemsPerPage,
                                    currentPage * itemsPerPage,
                                  )
                                  .map((addr, index) => (
                                    <div
                                      key={index}
                                      className="group flex items-start justify-between gap-3 rounded-sm p-2 even:bg-muted/30 hover:bg-muted/50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
                                          {(currentPage - 1) * itemsPerPage + index + 1}
                                        </div>
                                        {addr.startsWith('addr1') ? (
                                          <Link
                                            href={`https://pool.pm/${addr}`}
                                            target="_blank"
                                            className="break-all font-mono text-sm text-yellow-600"
                                          >
                                            {addr}
                                          </Link>
                                        ) : (
                                          <span className="break-all font-mono text-sm text-yellow-600">
                                            {addr}
                                          </span>
                                        )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                          navigator.clipboard.writeText(addr)
                                          toast.success('Address copied to clipboard')
                                        }}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                              </div>

                              <Pagination>
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        setCurrentPage(Math.max(1, currentPage - 1))
                                      }}
                                    />
                                  </PaginationItem>

                                  <PaginationItem>
                                    <span className="text-sm">
                                      Page {currentPage} of{' '}
                                      {Math.ceil(duplicates.size / itemsPerPage)}
                                    </span>
                                  </PaginationItem>

                                  <PaginationItem>
                                    <PaginationNext
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        setCurrentPage(
                                          Math.min(
                                            Math.ceil(duplicates.size / itemsPerPage),
                                            currentPage + 1,
                                          ),
                                        )
                                      }}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button
              onClick={handleAirdrop}
              disabled={isAirdropping}
              className={`mt-6 h-16 w-full text-lg font-semibold transition-all duration-500 ${
                isSuccess
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gradient-to-r from-primary to-purple-500 hover:to-purple-600 hover:shadow-lg'
              } relative overflow-hidden`}
            >
              {isAirdropping && <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />}
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
                  <span className="drop-shadow-sm">
                    Airdrop to {selectedAddresses.size + manualAddresses.length} Addresses
                  </span>
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
