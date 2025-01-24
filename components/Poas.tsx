'use client'

import { useWallet, WalletContextType } from '@/contexts/WalletContext'
import Image from 'next/image'
import { useState, useEffect, Fragment } from 'react'
import Button3D from './3dButton'
import Link from 'next/link'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Check, ChevronDown, Loader2, Plus, X, Trash2, Info } from 'lucide-react'
import { timeAgoCompact } from '@/lib/helper'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { AlertCircle } from 'lucide-react'
import { Label } from './ui/label'
import { LucidEvolution } from '@lucid-evolution/lucid'
import { useWindowSize } from '@uidotdev/usehooks'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletState } from '@/hooks/useWalletConnect'

type CardanoNetwork = 'Mainnet' | 'Preview' | 'Preprod'
export const CARDANO_NETWORK: CardanoNetwork =
  process.env.NODE_ENV === 'development' ? 'Preview' : 'Mainnet'

// const testing = process.env.NODE_ENV === 'development' ? true : false
const testing = false

const getLucid = async () => {
  const { Lucid, Blockfrost } = await import('@lucid-evolution/lucid')
  return { Lucid, Blockfrost }
}

const getScriptUtils = async () => {
  const {
    scriptFromNative,
    paymentCredentialOf,
    unixTimeToSlot,
    mintingPolicyToId,
    fromText,
    Data,
  } = await import('@lucid-evolution/lucid')
  return {
    scriptFromNative,
    paymentCredentialOf,
    unixTimeToSlot,
    mintingPolicyToId,
    fromText,
    Data,
  }
}

interface WalletApi {
  getExtensions(): Promise<any>
  getNetworkId(): Promise<number>
  getUsedAddresses(paginate?: any): Promise<string[]>
  getUnusedAddresses(): Promise<string[]>
  getRewardAddresses(): Promise<string[]>
  getChangeAddress(): Promise<string>
  getBalance(): Promise<string>
  getUtxos(amount?: string, paginate?: any): Promise<string[]>
  signTx(tx: string, partialSign?: boolean): Promise<string>
  signData(addr: string, sigStructure: string): Promise<{ signature: string; key: string }>
  submitTx(tx: string): Promise<string>
  getCollateral(): Promise<string[]>
  experimental: any
}

// Add interface for policy info
interface PolicyInfo {
  policyId: string
  keyHash: string
  slot?: number
  script: any
  isGenerated?: boolean
}

// Add this interface near the top with other interfaces
interface PinataFile {
  ipfs_pin_hash: string
  metadata?: {
    name?: string
  }
  date_pinned: string
  mime_type?: string
  name?: string
}

// Update the PinataResponse interface to include all files
interface PinataResponse {
  count: number
  rows: PinataFile[]
  filteredRows: PinataFile[] // Add this to store all valid files
}

interface PaginationState {
  currentPage: number
  totalPages: number
  itemsPerPage: number
}

// Update the VALID_IMAGE_MIMES constant to include HTML
const VALID_IMAGE_MIMES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.tiff': 'image/tiff',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.apng': 'image/apng',
  '.html': 'text/html', // Add HTML support
  '.htm': 'text/html', // Add HTM support
}

const VALID_IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.avif',
  '.tiff',
  '.tif',
  '.bmp',
  '.ico',
  '.apng',
  '.html', // Add HTML support
  '.htm', // Add HTM support
]

// Add this constant to define what files can be selected
const VALID_FILE_ACCEPT = [
  // Image MIME types
  ...Object.values(VALID_IMAGE_MIMES),
  // File extensions (for better browser support)
  ...VALID_IMAGE_EXTENSIONS.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`)),
].join(',')

// Update the formatSupportedExtensions helper to include HTML
const formatSupportedExtensions = () => {
  return [
    'PNG',
    'JPG/JPEG',
    'GIF',
    'SVG',
    'WEBP',
    'AVIF',
    'TIFF/TIF',
    'BMP',
    'ICO',
    'APNG',
    'HTML/HTM',
  ].join(', ')
}

// Update the validation function to be more robust
const isValidImageFile = (file: File): boolean => {
  // Check MIME type
  if (Object.values(VALID_IMAGE_MIMES).includes(file.type)) {
    return true
  }

  // Fallback to extension check if MIME type is not recognized
  const fileName = file.name.toLowerCase()
  return VALID_IMAGE_EXTENSIONS.some((ext) => fileName.endsWith(ext))
}

// Add this function near the top with other utility functions
const extractSlotFromScript = (script: any): number | undefined => {
  if (!script) return undefined
  if (script.type === 'before') return script.slot
  if (script.scripts?.length) return script.scripts.find((s: any) => s.type === 'before')?.slot
  if (script.json) return extractSlotFromScript(script.json)
  return undefined
}

// Utility function to create a minting policy
const createMintingPolicy = async (
  lucid: any,
  api: WalletApi,
  selectedPolicy: PolicyInfo,
  slot: number,
) => {
  const { scriptFromNative, paymentCredentialOf } = await getScriptUtils()
  const address = await lucid.wallet().address()
  const keyHash = paymentCredentialOf(address).hash

  let mintingPolicy

  if (selectedPolicy.script.type === 'sig') {
    mintingPolicy = scriptFromNative({
      type: 'sig',
      keyHash: selectedPolicy.script.keyHash,
    })
  } else {
    mintingPolicy = scriptFromNative({
      type: 'all',
      scripts: [
        { type: 'sig', keyHash },
        { type: 'before', slot },
      ],
    })
  }

  return mintingPolicy
}

// Update the FileInfo interface
interface FileInfo {
  url: string
  name: string
  customName?: string
  properties?: Record<string, string>
  date_pinned?: string
}

// Add a helper function to check if it's a CIDv0 hash
const isCIDv0 = (hash: string) => {
  // CIDv0 starts with "Qm" and is 46 characters long
  return hash.startsWith('Qm') && hash.length === 46
}

// Add this interface near other interfaces
interface ExpiryConfig {
  hasExpiry: boolean
  days: number
}

// Add this loading skeleton component
const FileGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 24 }).map((_, index) => (
        <div key={index} className="group relative">
          <div className="flex h-full cursor-pointer flex-col rounded-lg border border-border p-2 sm:p-4">
            <div className="flex flex-1 flex-col space-y-1">
              <div className="relative">
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="space-y-1">
                  <Skeleton className="mt-1 h-5 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Poas() {
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([])
  const [uploading, setUploading] = useState(false)
  const [pinataJWT, setPinataJWT] = useState<string | null>(null)
  const [generatingPolicy, setGeneratingPolicy] = useState(false)
  const [policyIds, setPolicyIds] = useState<PolicyInfo[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyInfo | null>(null)
  const { walletState, loading } = useWallet() as WalletContextType
  const [api, setApi] = useState<WalletApi | null>(null)
  const [scanning, setScanning] = useState(false)
  const [minting, setMinting] = useState(false)
  const [nftName, setNftName] = useState('')
  const [nftDescription, setNftDescription] = useState('')
  const [blockfrostKey, setBlockfrostKey] = useState<string | null>(null)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPinataDialog, setShowPinataDialog] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [loadingPolicies, setLoadingPolicies] = useState(false)
  const [openSections, setOpenSections] = useState<number[]>([1])
  const [pinataResponse, setPinataResponse] = useState<PinataResponse>({
    count: 0,
    rows: [],
    filteredRows: [],
  })
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 24,
  })
  const [lucid, setLucid] = useState<any | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [confirmationText, setConfirmationText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [selectedPinataFiles, setSelectedPinataFiles] = useState<PinataFile[]>([])
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null)
  const [imageNames, setImageNames] = useState<{ [key: string]: string }>({})
  const [expiryConfig, setExpiryConfig] = useState<ExpiryConfig>({
    hasExpiry: false,
    days: 1,
  })
  const [mintQuantity, setMintQuantity] = useState<number>(1)
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([])
  const [isMultiDeleteMode, setIsMultiDeleteMode] = useState(false)
  const [currentStakeAddress, setCurrentStakeAddress] = useState<string | null>(null)
  // Add new state for temporary trait edits
  const [traitEdits, setTraitEdits] = useState<
    Record<string, Record<number, { key: string; value: string }>>
  >({})

  const { width } = useWindowSize()

  const formatExpiryTime = (slot?: number) => {
    if (!slot) return null

    // Calculate days remaining
    const currentSlot = lucid?.currentSlot() || 0
    const slotsRemaining = slot - currentSlot
    const daysRemaining = Math.ceil(slotsRemaining / 86400)

    if (slotsRemaining <= 0) return 'Expired'
    if (daysRemaining === 1) return '1 day left'
    return `${daysRemaining} days left`
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return Boolean(blockfrostKey && pinataJWT)
      case 2:
        return Boolean(selectedFiles.length > 0)
      case 3:
        return Boolean(selectedPolicy)
      case 4:
        return Boolean(selectedPolicy && nftName && nftDescription && selectedFiles.length > 0)
      default:
        return false
    }
  }

  useEffect(() => {
    if (currentStep === 1 && blockfrostKey && pinataJWT) {
      setCurrentStep(2)
      setOpenSections([2])
    } else if (currentStep === 2 && selectedFiles.length > 0 && thumbnailImage) {
      setCurrentStep(3)
      setOpenSections([3])
    } else if (currentStep === 3 && selectedPolicy) {
      setCurrentStep(4)
      setOpenSections([4])
    }
  }, [blockfrostKey, pinataJWT, selectedFiles, thumbnailImage, currentStep])

  // Load all saved data when component mounts
  useEffect(() => {
    const savedJWT = localStorage.getItem('pinataJWT')
    if (savedJWT) setPinataJWT(savedJWT)

    const savedBlockfrost = localStorage.getItem('blockfrostKey')
    if (savedBlockfrost) setBlockfrostKey(savedBlockfrost)

    if (savedJWT && savedBlockfrost) {
      setCurrentStep(2)
      setOpenSections([2])
    }
  }, [walletState.wallet])

  const handleJWTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPinataJWT(value)
    localStorage.setItem('pinataJWT', value)
  }

  const handleBlockfrostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBlockfrostKey(value)
    localStorage.setItem('blockfrostKey', value)
  }

  useEffect(() => {
    const initializeWallet = async () => {
      if (walletState.wallet) {
        try {
          // connect to the wallet
          setApi(walletState.api)

          // initialize lucid and set it in state
          if (blockfrostKey) {
            const { Lucid, Blockfrost } = await getLucid()
            const lucidInstance = await Lucid(
              new Blockfrost(
                `https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0`,
                blockfrostKey,
              ),
              CARDANO_NETWORK,
            )
            lucidInstance.selectWallet.fromAPI(walletState.api!)
            setLucid(lucidInstance)
          }
        } catch (error) {
          if (error instanceof TypeError) {
            toast.error('Blockfrost key is not valid', { position: 'bottom-center' })
          } else {
            toast.error(
              'Unexpected error during wallet connection: ' +
                (error instanceof Error ? error.message : String(error)),
              {
                position: 'bottom-center',
              },
            )
          }
        }
      }
      setInitializing(false)
    }

    initializeWallet()
  }, [walletState.wallet, blockfrostKey])

  // Add polling effect to check stake address
  useEffect(() => {
    if (!walletState.api) return

    const checkStakeAddressAndReconnect = async () => {
      try {
        const rewardAddresses = await walletState.api.getRewardAddresses()
        const stakeAddress = rewardAddresses[0]

        if (stakeAddress && stakeAddress !== currentStakeAddress) {
          setCurrentStakeAddress(stakeAddress)
          setSelectedPolicy(null)
          setPolicyIds([])

          // Reconnect Lucid if needed
          if (blockfrostKey && walletState.api) {
            try {
              const { Lucid, Blockfrost } = await getLucid()
              const lucidInstance = await Lucid(
                new Blockfrost(
                  `https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0`,
                  blockfrostKey,
                ),
                CARDANO_NETWORK,
              )
              lucidInstance.selectWallet.fromAPI(walletState.api)
              setLucid(lucidInstance)
            } catch (error) {
              console.error('Error reconnecting Lucid:', error)
            }
          }
        }
      } catch (error) {
        console.log('error', error)
        if (error instanceof Error && error.message.includes('account changed')) {
          if (currentStakeAddress) {
            console.log('Account change detected')
            setSelectedPolicy(null)
            setPolicyIds([])
          }
        } else {
          console.error('Error checking stake address:', error)
        }
      }
    }

    checkStakeAddressAndReconnect()

    // return () => clearInterval(intervalId)
  }, [currentStakeAddress, blockfrostKey, walletState.api])

  // Remove the duplicate wallet checking effect and replace with:
  useEffect(() => {
    const handleWalletStateChange = (event: CustomEvent<WalletState>) => {
      // Handle any UI updates needed when wallet state changes
      if (event.detail.stakeAddress !== currentStakeAddress) {
        setCurrentStakeAddress(event.detail.stakeAddress)
        setSelectedPolicy(null)
        setPolicyIds([])
      }
    }

    window.addEventListener('walletStateChanged', handleWalletStateChange as EventListener)

    return () => {
      window.removeEventListener('walletStateChanged', handleWalletStateChange as EventListener)
    }
  }, [currentStakeAddress])

  const ImageWithFallback = ({
    src,
    alt,
    fileUrl,
    ...props
  }: {
    src: string
    alt: string
    fileUrl?: string
    [key: string]: any
  }) => {
    const [error, setError] = useState(false)
    const isGif = src.toLowerCase().endsWith('.gif') || src.includes('image/gif')

    return error ? (
      <div className="flex h-32 w-full items-center justify-center rounded-lg bg-muted/30">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-6 w-6" />
          <span className="text-xs">Failed to load image</span>
        </div>
      </div>
    ) : (
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        className={`h-32 w-full cursor-pointer rounded-lg object-contain ${
          fileUrl === thumbnailImage && 'outline-dashed outline-1 outline-primary'
        }`}
        onError={() => setError(true)}
        unoptimized={isGif} // Disable optimization for GIFs
        {...props}
      />
    )
  }

  const mintNFT = async (
    lucid: LucidEvolution,
    api: WalletApi,
    selectedPolicy: PolicyInfo,
    nftName: string,
    nftDescription: string,
    selectedFiles: FileInfo[],
  ) => {
    setMinting(true)
    try {
      const { fromText } = await getScriptUtils()

      if (!thumbnailImage) {
        toast.error('Please select a thumbnail image', { position: 'bottom-center' })
        return
      }

      const address = await lucid.wallet().address()

      // Get the thumbnail file info
      const thumbnailFileInfo = selectedFiles.find((file) => file.url === thumbnailImage)
      if (!thumbnailFileInfo) {
        toast.error('Thumbnail file info not found', { position: 'bottom-center' })
        return
      }

      // Get the extension and MIME type for the thumbnail
      const thumbnailExt = '.' + thumbnailFileInfo.name.split('.').pop()!.toLowerCase()
      const thumbnailMimeType = VALID_IMAGE_MIMES[thumbnailExt] || 'image/png'

      // Format the files array according to CIP-25
      const formattedFiles = selectedFiles.map((file) => {
        const extension = '.' + file.name.split('.').pop()!.toLowerCase()
        return {
          name: file.customName || file.name,
          mediaType: VALID_IMAGE_MIMES[extension] || 'image/png',
          src: `ipfs://${file.url}`,
          ...(file.properties && Object.keys(file.properties).length > 0
            ? file.properties // Directly spread the properties instead of nesting under 'properties'
            : {}),
        }
      })

      // Construct the metadata according to CIP-25 (version 1.0)
      const metadata = {
        [selectedPolicy.policyId]: {
          [nftName]: {
            name: nftName,
            image: `ipfs://${thumbnailImage}`,
            mediaType: thumbnailMimeType,
            description: nftDescription,
            files: formattedFiles,
          },
        },
      }

      // Transaction to mint the NFT
      const tx = await lucid
        .newTx()
        .mintAssets({
          [selectedPolicy.policyId + fromText(nftName)]: BigInt(mintQuantity),
        })
        .attachMetadata(721, metadata)
        .validTo(Date.now() + 1200000)
        .pay.ToAddress(address, {
          [selectedPolicy.policyId + fromText(nftName)]: BigInt(mintQuantity),
        })
        .attach.MintingPolicy(
          await createMintingPolicy(
            lucid,
            api,
            selectedPolicy,
            selectedPolicy.slot ?? lucid.currentSlot() + 36000,
          ),
        )
        .complete()

      const signedTx = await tx.sign.withWallet().complete()
      const txHash = await signedTx.submit()
      toast.success(`Minted NFT with transaction hash: ${txHash}`, { position: 'bottom-center' })
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, { position: 'bottom-center' })
      } else {
        toast.error('Minting failed: An unexpected error occurred.', { position: 'bottom-center' })
      }
    } finally {
      setMinting(false)
    }
  }

  const uploadFile = async (selectedFiles?: File[]) => {
    try {
      if (!selectedFiles || selectedFiles.length === 0) {
        toast.error('No files selected', { position: 'bottom-center' })
        return
      }

      // Check if all files are valid
      for (const file of selectedFiles) {
        if (!isValidImageFile(file)) {
          toast.error(`Invalid file format: ${file.name}`, { position: 'bottom-center' })
          return
        }
      }

      setUploading(true)

      // Create an array of promises for each file upload
      const uploadPromises = selectedFiles.map(async (file) => {
        const data = new FormData()
        data.append('file', file)

        // Add metadata to identify file type
        const metadata = {
          name: file.name,
          keyvalues: {
            fileType:
              file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')
                ? 'html'
                : 'image',
            mimeType:
              file.type ||
              (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')
                ? 'text/html'
                : 'image/png'),
            extension: file.name.split('.').pop()?.toLowerCase(),
          },
        }

        data.append('pinataMetadata', JSON.stringify(metadata))
        data.append('pinataOptions', JSON.stringify({ cidVersion: 0 }))

        const uploadRequest = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
          },
          body: data,
        })

        const response = await uploadRequest.json()

        if (!response.IpfsHash) {
          throw new Error(`Unexpected response format for ${file.name}: IpfsHash not found`)
        }
      })

      // Wait for all uploads to complete
      await Promise.all(uploadPromises)

      let message =
        selectedFiles.length > 1
          ? 'Files uploaded successfully. Browse uploaded files to select them.'
          : 'File uploaded successfully. Browse uploaded files to select it.'

      toast.success(message, {
        position: 'bottom-center',
      })

      setUploading(false)
      // Automatically open the browse dialog after upload
      loadPinataFiles(1)
    } catch (e) {
      console.log(e)
      setUploading(false)
      toast.error('Trouble uploading files to IPFS', { position: 'bottom-center' })
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    setFiles(selectedFiles)
    // submit if there's an api key and files
    if (pinataJWT && selectedFiles.length > 0) {
      await uploadFile(selectedFiles)
    } else {
      toast.error('Please enter a Pinata JWT and select files', { position: 'bottom-center' })
    }
  }

  const generatePolicyId = async () => {
    if (!api) {
      toast.error('Please connect your wallet first', { position: 'bottom-center' })
      return
    }

    try {
      setGeneratingPolicy(true)
      const { Lucid, Blockfrost } = await getLucid()
      const lucid = await Lucid(
        new Blockfrost(
          `https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0`,
          blockfrostKey || undefined,
        ),
        CARDANO_NETWORK,
      )
      lucid.selectWallet.fromAPI(api)
      const { scriptFromNative, paymentCredentialOf, mintingPolicyToId } = await getScriptUtils()

      const address = await lucid.wallet().address()
      const keyHash = paymentCredentialOf(address).hash

      // Calculate expiry slot if needed
      const currentSlot = lucid.currentSlot()
      const expirySlot = expiryConfig.hasExpiry
        ? currentSlot + expiryConfig.days * 86400
        : undefined

      // Generate policy with or without expiry
      const mintingPolicy = scriptFromNative(
        expiryConfig.hasExpiry
          ? {
              type: 'all',
              scripts: [
                { type: 'sig', keyHash },
                { type: 'before', slot: expirySlot! },
              ],
            }
          : {
              type: 'sig',
              keyHash,
            },
      )

      const policyId = mintingPolicyToId(mintingPolicy)

      const newPolicy: PolicyInfo = {
        policyId,
        keyHash,
        slot: expirySlot,
        script: expiryConfig.hasExpiry
          ? {
              type: 'all',
              scripts: [
                { type: 'sig', keyHash },
                { type: 'before', slot: expirySlot! },
              ],
            }
          : {
              type: 'sig',
              keyHash,
            },
        isGenerated: true,
      }

      // Update state with new policy
      setPolicyIds((prev) => [...prev, newPolicy])
      setSelectedPolicy(newPolicy)
      setCurrentStep(4)
      setOpenSections([4])

      // Update success message based on expiry
      const message = expiryConfig.hasExpiry
        ? `${policyId} will expire in ${expiryConfig.days} day${expiryConfig.days > 1 ? 's' : ''}.`
        : `${policyId} has no expiry date.`

      toast.success(
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>,
        { position: 'bottom-center', duration: 6000 },
      )
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error generating policy ID: ' + error.message, { position: 'bottom-center' })
    } finally {
      setGeneratingPolicy(false)
    }
  }

  const loadPolicies = async () => {
    if (!api || !blockfrostKey) {
      toast.error('Please connect wallet and enter Blockfrost key first', {
        position: 'bottom-center',
      })
      return
    }

    try {
      setLoadingPolicies(true)
      setScanning(true)
      const { Lucid, Blockfrost } = await getLucid()
      const { paymentCredentialOf } = await getScriptUtils()

      const lucid = await Lucid(
        new Blockfrost(
          `https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0`,
          blockfrostKey,
        ),
        CARDANO_NETWORK,
      )

      lucid.selectWallet.fromAPI(api)
      const address = await lucid.wallet().address()
      const keyHash = paymentCredentialOf(address).hash

      const allUTxOs = await lucid.utxosAt(address)
      const policyIdsFromUtxos = new Map()
      for (const utxo of allUTxOs) {
        for (const assetId of Object.keys(utxo.assets)) {
          if (assetId.length > 56) {
            const policyId = assetId.slice(0, 56)
            policyIdsFromUtxos.set(policyId, assetId)
          }
        }
      }

      // Create array of promises for all policy ID fetches
      const policyPromises = Array.from(policyIdsFromUtxos.keys()).map(async (policyId) => {
        try {
          const scriptDetailsResponse = await fetch(
            `https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0/scripts/${policyId}/json`,
            {
              headers: {
                project_id: blockfrostKey,
              },
            },
          )

          if (!scriptDetailsResponse.ok) return null

          const scriptDetails = await scriptDetailsResponse.json()
          const keyHashMatches = scriptDetails?.json
            ? scriptDetails.json.keyHash
              ? scriptDetails.json.keyHash === keyHash
              : scriptDetails.json.scripts?.[0]?.keyHash === keyHash
            : false

          if (keyHashMatches) {
            return {
              policyId,
              slot: extractSlotFromScript(scriptDetails.json),
              script: scriptDetails.json,
              keyHash,
            }
          }
          return null
        } catch (error) {
          console.error(`Error fetching policy ${policyId}:`, error)
          return null
        }
      })

      // Wait for all promises to resolve
      const policyResults = await Promise.all(policyPromises)

      // Filter out null results and add to policies Map
      const policies = new Map(
        policyResults
          .filter((result): result is NonNullable<typeof result> => result !== null)
          .map((policy) => [policy.policyId, policy]),
      )

      const balance = await walletState.api.getBalance()
      if (Number(balance) < 1000000) {
        toast.error('Insufficient balance, please add funds to your wallet', {
          position: 'bottom-center',
        })
        return
      }

      const validPolicies = Array.from(policies.values())
        .filter((p: any) => {
          const policyId = typeof p === 'string' ? p : p.policyId
          return policyId.length === 56
        })
        .map((p: any) => ({
          policyId: p.policyId,
          keyHash: keyHash,
          slot: p.slot,
          script: p.script,
        }))

      setPolicyIds((prevPolicies) => {
        const mergedPolicies = [...prevPolicies, ...validPolicies]
        const uniquePolicies = mergedPolicies.reduce((acc, current) => {
          const x = acc.find((item: PolicyInfo) => item.policyId === current.policyId)
          if (!x) {
            return acc.concat([
              {
                ...current,
              },
            ])
          } else {
            return acc
          }
        }, [] as PolicyInfo[])
        return uniquePolicies
      })

      if (validPolicies.length === 0) {
        toast.info('No policies found, generate a new policy ID', { position: 'bottom-center' })
      } else {
        toast.success(
          <div className="flex flex-col gap-2">
            Loaded {validPolicies.length} existing policy ID{validPolicies.length > 1 ? 's' : ''}
          </div>,
          { position: 'bottom-center', duration: 6000 },
        )
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error loading policies: ' + error.message, { position: 'bottom-center' })
    } finally {
      setLoadingPolicies(false)
      setScanning(false)
    }
  }

  const loadPinataFiles = async (page: number = 1) => {
    try {
      setLoadingFiles(true)

      // Build the query URL with metadata filters
      const queryParams = new URLSearchParams({
        status: 'pinned',
        pageLimit: pagination.itemsPerPage.toString(),
        pageOffset: ((page - 1) * pagination.itemsPerPage).toString(),
      })

      const response = await fetch(`https://api.pinata.cloud/data/pinList?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch files')

      const data = await response.json()

      // Sort files by date
      const sortedFiles = data.rows.sort((a: PinataFile, b: PinataFile) => {
        return new Date(b.date_pinned).getTime() - new Date(a.date_pinned).getTime()
      })

      // Filter out CIDv1 hashes and sort remaining files by date
      const filteredFiles = sortedFiles.filter((file: PinataFile) => isCIDv0(file.ipfs_pin_hash))

      setPinataResponse({
        count: data.count,
        rows: filteredFiles,
        filteredRows: filteredFiles,
      })

      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(data.count / pagination.itemsPerPage),
      }))

      if (page === 1) {
        setShowPinataDialog(true)
      }
    } catch (error: any) {
      console.warn('Error loading files: ' + error.message)
      toast.error('Failed to load files', { position: 'bottom-center' })
    } finally {
      setLoadingFiles(false)
    }
  }

  // Update the handlePageChange function to fetch new data
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    loadPinataFiles(newPage)
  }

  // Update the deleteFile function to handle non-JSON responses and remove the deleted file from state
  const deleteFile = async (cid: string) => {
    const options = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
      },
    }

    // Optimistically update the UI
    const previousFiles = pinataResponse.rows // Store previous state
    const previousFilteredRows = pinataResponse.filteredRows // Store previous filtered rows
    setPinataResponse((prev) => ({
      ...prev,
      rows: prev.rows.filter((file) => file.ipfs_pin_hash !== cid), // Filter out the deleted file
      filteredRows: prev.filteredRows.filter((file) => file.ipfs_pin_hash !== cid), // Also filter from filteredRows
    }))

    try {
      const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, options)
      const result = await response.text() // Use .text() to get the response as plain text

      if (response.ok) {
        // Update pagination if needed
        const newTotalPages = Math.ceil(
          (pinataResponse.filteredRows.length - 1) / pagination.itemsPerPage,
        )
        setPagination((prev) => ({
          ...prev,
          totalPages: newTotalPages,
          currentPage: prev.currentPage > newTotalPages ? newTotalPages : prev.currentPage,
        }))
        toast.success('File deleted successfully', { position: 'bottom-center' })
      } else {
        // Revert the optimistic update if the delete fails
        setPinataResponse((prev) => ({
          ...prev,
          rows: previousFiles, // Restore previous state
          filteredRows: previousFilteredRows, // Restore previous filtered rows
        }))
        toast.error('Failed to delete file: ' + result, { position: 'bottom-center' })
      }
    } catch (error) {
      // Revert the optimistic update if an error occurs
      setPinataResponse((prev) => ({
        ...prev,
        rows: previousFiles, // Restore previous state
        filteredRows: previousFilteredRows, // Restore previous filtered rows
      }))
      console.error('Error deleting file:', error)
      toast.error('Error deleting file: ' + (error as Error).message, { position: 'bottom-center' })
    }
  }

  // Function to handle file deletion confirmation
  const handleDeleteConfirmation = async () => {
    if (confirmationText.toLowerCase() === 'confirm' && fileToDelete) {
      await deleteFile(fileToDelete)
      setConfirmationText('') // Reset confirmation text
      setFileToDelete(null) // Reset file to delete
      setPinataResponse((prev) => ({
        ...prev,
        rows: prev.rows.filter((file) => file.ipfs_pin_hash !== fileToDelete),
      }))
      setSelectedPinataFiles((prev) => prev.filter((file) => file.ipfs_pin_hash !== fileToDelete))
      // if the file is selected as thumbnail, set thumbnail to null
      if (thumbnailImage === fileToDelete) {
        setThumbnailImage(null)
      }
    }
    setIsConfirmDialogOpen(false) // Close the dialog
  }

  // Modified handleTraitChange to work with temporary state
  const handleTraitChange = (
    fileUrl: string,
    propertyIndex: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    setTraitEdits((prev) => ({
      ...prev,
      [fileUrl]: {
        ...(prev[fileUrl] || {}),
        [propertyIndex]: {
          ...(prev[fileUrl]?.[propertyIndex] || {
            key:
              Object.keys(selectedFiles.find((f) => f.url === fileUrl)?.properties || {})[
                propertyIndex
              ] || '',
            value:
              Object.values(selectedFiles.find((f) => f.url === fileUrl)?.properties || {})[
                propertyIndex
              ] || '',
          }),
          [field]: value,
        },
      },
    }))
  }

  const handleNameChange = (url: string, value: string) => {
    setImageNames((prev) => ({ ...prev, [url]: value }))
  }

  // Function to check if all images have names
  const areAllNamesEntered = () => {
    return selectedFiles.every((fileInfo) => imageNames[fileInfo.url]?.trim() !== '')
  }

  // Update the useEffect for step advancement
  useEffect(() => {
    if (currentStep === 2 && !areAllNamesEntered()) {
      // Prevent advancing to step 3 if not all names are entered
      setCurrentStep(2)
      setOpenSections([2])
    }
  }, [imageNames, currentStep])

  // Update the addTraitToImage function
  const addTraitToImage = (fileUrl: string) => {
    // Only allow adding a new trait if all existing traits are valid
    if (!areAllTraitPairsValid(fileUrl)) {
      toast.error('Please fill in all existing traits before adding a new one', {
        position: 'bottom-center',
      })
      return
    }

    setSelectedFiles((prev) =>
      prev.map((fileInfo) => {
        if (fileInfo.url === fileUrl) {
          const properties = { ...fileInfo.properties }
          const newIndex = Object.keys(properties).length
          // Add empty key-value pair with blank values
          properties[`${newIndex}`] = '' // Using just the index as key, value will be blank
          return { ...fileInfo, properties }
        }
        return fileInfo
      }),
    )
  }

  // Add this function to remove a trait from a specific image
  const removeTraitFromImage = (fileUrl: string, propertyIndex: number) => {
    setSelectedFiles((prev) =>
      prev.map((fileInfo) => {
        if (fileInfo.url === fileUrl) {
          const properties = { ...fileInfo.properties }
          const keys = Object.keys(properties)
          const keyToRemove = keys[propertyIndex]
          if (keyToRemove) {
            delete properties[keyToRemove]
          }
          return { ...fileInfo, properties }
        }
        return fileInfo
      }),
    )
  }

  // Add this function near other delete-related functions
  const handleMultiDelete = async () => {
    if (selectedForDeletion.length === 0) {
      toast.error('No files selected for deletion', { position: 'bottom-center' })
      return
    }

    setIsConfirmDialogOpen(true)
  }

  // Add new function to save traits
  const saveTraits = (fileUrl: string) => {
    const fileEdits = traitEdits[fileUrl]
    if (!fileEdits) return

    setSelectedFiles((prev) =>
      prev.map((fileInfo) => {
        if (fileInfo.url === fileUrl) {
          const newProperties: Record<string, string> = {}
          const existingKeys = new Set()

          // First pass: collect all valid traits
          Object.values(fileEdits).forEach(({ key, value }) => {
            if (key && !existingKeys.has(key)) {
              newProperties[key] = value
              existingKeys.add(key)
            }
          })

          return {
            ...fileInfo,
            properties: newProperties,
          }
        }
        return fileInfo
      }),
    )

    // Clear edits for this file
    setTraitEdits((prev) => {
      const newEdits = { ...prev }
      delete newEdits[fileUrl]
      return newEdits
    })

    toast.success('Traits saved successfully', { position: 'bottom-center' })
  }

  // Add new function to check if there are unsaved changes
  const hasUnsavedChanges = (fileUrl: string) => {
    return !!traitEdits[fileUrl]
  }

  // Add this function to check if a trait pair is valid (both key and value have at least 1 character)
  const isTraitPairValid = (key: string, value: string) => {
    return key.trim().length > 0 && value.trim().length > 0
  }

  // Add this function to check if all current trait pairs are valid
  const areAllTraitPairsValid = (fileUrl: string) => {
    const fileEdits = traitEdits[fileUrl] || {}
    const fileInfo = selectedFiles.find((f) => f.url === fileUrl)
    const fileProperties = fileInfo?.properties || {}

    // Get all property indices
    const indices = Object.keys(fileProperties).length

    // Check each index
    for (let i = 0; i < indices; i++) {
      // Get either the edited values or the original values
      const trait = fileEdits[i] || {
        key: Object.keys(fileProperties)[i] || '',
        value: Object.values(fileProperties)[i] || '',
      }

      // If either key or value is empty, return false
      if (!isTraitPairValid(trait.key, trait.value)) {
        return false
      }
    }

    return true
  }

  if (initializing || loading) {
    return (
      <div className="flex h-[69vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Waiting for wallet...</p>
        </div>
      </div>
    )
  }

  if (!walletState.wallet) {
    return (
      <div className="flex h-[69vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">Connect a wallet to get started</p>
        </div>
      </div>
    )
  }

  const steps = [
    { step: 1, tooltip: 'Enter your API keys for Blockfrost and Pinata', title: 'API Keys' },
    {
      step: 2,
      tooltip: 'Upload your NFT asset to IPFS or select a file from Pinata',
      title: 'IPFS/Storage',
    },
    { step: 3, tooltip: 'Select or generate a minting policy', title: 'Policy ID' },
    { step: 4, tooltip: 'Set NFT metadata and mint', title: 'Metadata/Mint' },
  ]

  const FileGrid = () => {
    return (
      <div
        className={`grid max-w-[100vw] grid-cols-1 gap-2 p-2 ${
          isMultiDeleteMode
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {pinataResponse.rows.map((file) => (
          <div
            key={file.ipfs_pin_hash}
            className={`group relative rounded-lg ${
              selectedPinataFiles.some((selected) => selected.ipfs_pin_hash === file.ipfs_pin_hash)
                ? 'outline outline-2 outline-primary'
                : ''
            }`}
            onClick={() => {
              if (isMultiDeleteMode) {
                // Handle multi-delete selection
                setSelectedForDeletion((prev) =>
                  prev.includes(file.ipfs_pin_hash)
                    ? prev.filter((hash) => hash !== file.ipfs_pin_hash)
                    : [...prev, file.ipfs_pin_hash],
                )
              } else {
                // Handle file selection
                setSelectedPinataFiles((prev) => {
                  const isSelected = prev.some(
                    (selected) => selected.ipfs_pin_hash === file.ipfs_pin_hash,
                  )
                  if (isSelected) {
                    return prev.filter((selected) => selected.ipfs_pin_hash !== file.ipfs_pin_hash)
                  } else {
                    return [...prev, file]
                  }
                })

                // Also update selectedFiles state with the file info
                const fileInfo = {
                  url: file.ipfs_pin_hash,
                  name: file.metadata?.name || file.name || file.ipfs_pin_hash,
                  date_pinned: file.date_pinned,
                }

                setSelectedFiles((prev) => {
                  const isSelected = prev.some((selected) => selected.url === file.ipfs_pin_hash)
                  if (isSelected) {
                    return prev.filter((selected) => selected.url !== file.ipfs_pin_hash)
                  } else {
                    return [...prev, fileInfo]
                  }
                })
              }
            }}
          >
            <div
              className={`flex cursor-pointer flex-col rounded-lg border border-border ${
                isMultiDeleteMode ? 'p-1' : 'p-2 sm:p-4'
              }`}
            >
              {isMultiDeleteMode && (
                <div className="absolute right-2 top-2 z-10">
                  <div
                    className={`h-4 w-4 rounded border ${
                      selectedForDeletion.includes(file.ipfs_pin_hash)
                        ? 'border-destructive bg-destructive'
                        : 'border-border bg-background'
                    } flex items-center justify-center`}
                  >
                    {selectedForDeletion.includes(file.ipfs_pin_hash) && (
                      <Check className="h-3 w-3 text-destructive-foreground" />
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-1 flex-col space-y-1">
                <div className="relative">
                  <ImageWithFallback
                    src={`https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`}
                    alt={file.metadata?.name || 'Pinata file'}
                    className={`w-full rounded-lg object-contain ${
                      isMultiDeleteMode ? 'h-20 sm:h-28' : 'h-32'
                    }`}
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-1 px-1">
                    <span
                      className={`block truncate ${
                        isMultiDeleteMode ? 'text-xs' : 'text-sm sm:text-base md:text-lg'
                      }`}
                    >
                      {(() => {
                        const fullName = file.metadata?.name || file.name || ''
                        return fullName
                      })()}
                    </span>
                    <div className="flex items-center justify-between">
                      <span
                        className={`block text-muted-foreground ${
                          isMultiDeleteMode ? 'text-xs' : 'text-sm sm:text-base md:text-lg'
                        }`}
                      >
                        {timeAgoCompact(new Date(file.date_pinned))}
                      </span>
                      {!isMultiDeleteMode && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFileToDelete(file.ipfs_pin_hash)
                            setIsConfirmDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const FilesGridHeader = () => (
    <div className="sticky top-0 z-10 flex w-full flex-col border-b bg-background shadow-sm">
      <div className="mx-3 flex flex-col gap-2 py-2 sm:mx-6 sm:py-4 md:py-5">
        <div className="flex w-full items-center justify-between">
          <DialogTitle className="text-base font-medium sm:text-lg md:text-xl lg:text-2xl">
            {(() => {
              const totalFileCount = pinataResponse.count
              if (totalFileCount === 0) return 'No files found'
              if (totalFileCount >= 1000) {
                return `${(totalFileCount / 1000).toFixed(1)}k files`
              }
              return `${selectedFiles.length}/${totalFileCount} ${totalFileCount === 1 || selectedFiles.length === 1 ? 'file' : 'files'} selected`
            })()}
          </DialogTitle>
          <DialogClose className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary/80 sm:h-10 sm:w-10 md:h-12 md:w-12">
            <X className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <div className="flex w-full justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsMultiDeleteMode(!isMultiDeleteMode)
              setSelectedForDeletion([])
            }}
            className={`flex h-8 items-center justify-center gap-1.5 text-base sm:h-9 sm:text-lg md:h-10 md:text-xl lg:h-11 lg:text-2xl ${
              isMultiDeleteMode ? 'bg-destructive text-destructive-foreground' : ''
            }`}
          >
            {isMultiDeleteMode ? (
              <>
                <X className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
                Cancel
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
                Delete
              </>
            )}
          </Button>
          {isMultiDeleteMode ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMultiDelete}
              disabled={selectedForDeletion.length === 0}
              className="flex h-8 items-center justify-center gap-1.5 text-base sm:h-9 sm:text-lg md:h-10 md:text-xl lg:h-11 lg:text-2xl"
            >
              <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
              Delete ({selectedForDeletion.length})
            </Button>
          ) : (
            selectedFiles.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowPinataDialog(false)}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11"
              >
                <Check className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  )

  return (
    <main className="m-auto flex w-full max-w-3xl flex-col items-center justify-center gap-4 p-4 md:max-w-4xl">
      {/* Progress indicator */}
      <TooltipProvider delayDuration={50}>
        <div className="mb-4 flex w-full justify-between px-2">
          {steps.map(({ step, tooltip, title }) => (
            <Tooltip key={step}>
              <TooltipTrigger>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                        isStepComplete(step)
                          ? 'border-primary bg-primary font-bold text-white shadow-lg shadow-primary/30 ring-2 ring-primary/10 ring-offset-2'
                          : step === currentStep
                            ? 'animate-pulse-slow border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/10 ring-offset-2'
                            : 'border-muted bg-background text-muted-foreground hover:scale-110 hover:border-muted-foreground/50 hover:shadow-sm'
                      }`}
                    >
                      {step}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{title}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Step 1: API Keys */}
      <Collapsible
        open={openSections.includes(1)}
        onOpenChange={(isOpen) => {
          setOpenSections(isOpen ? [...openSections, 1] : openSections.filter((s) => s !== 1))
        }}
        className="w-full rounded-lg border border-border bg-card"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-secondary/10">
          <h2 className="text-xl font-semibold">Step 1: {steps[0].title}</h2>
          <div className="flex items-center gap-2">
            {isStepComplete(1) && <Check className="h-4 w-4 text-green-500" />}
            <ChevronDown className="h-4 w-4" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 pt-2">
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Blockfrost Project ID</label>
              <Input
                value={blockfrostKey || ''}
                onChange={handleBlockfrostChange}
                className={`${!blockfrostKey ? 'border-red-500/50' : ''}`}
              />
              <Link
                href="https://blockfrost.io/dashboard"
                target="_blank"
                className="mt-1 text-xs text-muted-foreground hover:text-primary"
              >
                Need a Blockfrost API Key?
              </Link>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Pinata JWT</label>
              <Input
                value={pinataJWT || ''}
                onChange={handleJWTChange}
                className={`${!pinataJWT ? 'border-red-500/50' : ''}`}
              />
              <Link
                href="https://app.pinata.cloud/developers/api-keys"
                target="_blank"
                className="mt-1 text-xs text-muted-foreground hover:text-primary"
              >
                Need a Pinata API Key?
              </Link>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Step 2: File Upload */}
      {blockfrostKey && pinataJWT && (
        <Collapsible
          open={openSections.includes(2)}
          onOpenChange={(isOpen) => {
            setOpenSections(isOpen ? [...openSections, 2] : openSections.filter((s) => s !== 2))
          }}
          className="w-full rounded-lg border border-border bg-card"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-secondary/10">
            <h2 className="text-lg font-semibold">Step 2: {steps[1].title}</h2>
            <div className="flex items-center gap-2">
              {isStepComplete(2) && <Check className="h-4 w-4 text-green-500" />}
              <ChevronDown className="h-4 w-4" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 pt-2">
            <div className="flex flex-col gap-4">
              <Button3D
                disabled={!isStepComplete(1) || loadingFiles}
                onClick={() => loadPinataFiles(1)}
                variant="outline"
              >
                {loadingFiles ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Browse Uploaded Files'
                )}
              </Button3D>

              <div className="flex gap-4">
                <Input
                  type="file"
                  onChange={handleChange}
                  disabled={!isStepComplete(1)}
                  className="flex-1"
                  accept={VALID_FILE_ACCEPT}
                  multiple
                />
                <Button3D
                  disabled={!isStepComplete(1) || uploading || !files.length}
                  onClick={() => uploadFile(files)}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button3D>
              </div>

              {/* File preview section */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-col gap-4">
                  {!thumbnailImage && (
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-500">
                      <AlertCircle className="h-4 w-4 animate-pulse" />
                      <span>
                        Please select a preview image by clicking on one of the images below
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedFiles.map((fileInfo) => (
                      <div key={fileInfo.url} className="group relative h-full">
                        <div
                          className={`flex h-full flex-col rounded-lg border border-border bg-background/50 p-4 transition-all hover:shadow-lg hover:shadow-primary/5 hover:ring-1 hover:ring-primary/20`}
                        >
                          <div className="flex flex-1 flex-col space-y-2">
                            {/* Image preview */}
                            <div className="relative">
                              <ImageWithFallback
                                src={`https://gateway.pinata.cloud/ipfs/${fileInfo.url}`}
                                fileUrl={fileInfo.url}
                                alt={fileInfo.name}
                                onClick={() => {
                                  if (thumbnailImage === fileInfo.url) {
                                    // Deselect the thumbnail if it's already selected
                                    setThumbnailImage(null)
                                  } else {
                                    // Select new thumbnail
                                    setThumbnailImage(fileInfo.url)
                                  }
                                }}
                              />
                              {thumbnailImage === fileInfo.url && (
                                <div className="absolute right-2 top-2 rounded-md bg-primary/90 px-2 py-1 text-xs text-white backdrop-blur-sm">
                                  Preview Image
                                </div>
                              )}
                            </div>

                            {/* Filename editor with improved styling */}
                            <div className="flex items-center gap-1 rounded-lg border border-border bg-background/50 p-2">
                              <Input
                                value={
                                  fileInfo.customName?.split('.').slice(0, -1).join('.') ||
                                  fileInfo.name.split('.').slice(0, -1).join('.')
                                }
                                onChange={(e) => {
                                  e.stopPropagation()
                                  const extension = fileInfo.name.split('.').pop()
                                  const newName = `${e.target.value}.${extension}`
                                  setSelectedFiles((prev) =>
                                    prev.map((f) =>
                                      f.url === fileInfo.url ? { ...f, customName: newName } : f,
                                    ),
                                  )
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 flex-1 border-none text-xs shadow-none focus-visible:ring-0"
                                placeholder="File name"
                              />
                              <span className="text-xs text-muted-foreground">
                                .{fileInfo.name.split('.').pop()}
                              </span>
                            </div>

                            {/* Action buttons with improved styling */}
                            <div className="flex items-center justify-between gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 px-3 font-medium transition-colors hover:bg-primary/10 hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addTraitToImage(fileInfo.url)
                                }}
                              >
                                Add Trait
                                <Plus className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 font-medium transition-colors hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedFiles((prev) =>
                                    prev.filter((f) => f.url !== fileInfo.url),
                                  )
                                  // Add this line to keep selectedPinataFiles in sync
                                  setSelectedPinataFiles((prev) =>
                                    prev.filter((f) => f.ipfs_pin_hash !== fileInfo.url),
                                  )
                                }}
                              >
                                Remove File
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Traits section with improved styling */}
                            <div className="flex flex-col flex-wrap gap-1">
                              {Object.entries(fileInfo.properties || {}).map(
                                ([key, value], propertyIndex) => (
                                  <div
                                    key={propertyIndex}
                                    className="group flex items-center gap-2 rounded-lg bg-background/50 p-1"
                                  >
                                    <Input
                                      placeholder="Key"
                                      value={traitEdits[fileInfo.url]?.[propertyIndex]?.key ?? key}
                                      className={`h-8 flex-1 border border-border bg-background/50 text-xs shadow-none focus-visible:ring-0 ${
                                        !isTraitPairValid(
                                          traitEdits[fileInfo.url]?.[propertyIndex]?.key ?? key,
                                          traitEdits[fileInfo.url]?.[propertyIndex]?.value ?? value,
                                        )
                                          ? 'border-red-500/50'
                                          : ''
                                      }`}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleTraitChange(
                                          fileInfo.url,
                                          propertyIndex,
                                          'key',
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <Input
                                      placeholder="Value"
                                      value={
                                        traitEdits[fileInfo.url]?.[propertyIndex]?.value ?? value
                                      }
                                      className={`h-8 flex-1 border border-border bg-background/50 text-xs shadow-none focus-visible:ring-0 ${
                                        !isTraitPairValid(
                                          traitEdits[fileInfo.url]?.[propertyIndex]?.key ?? key,
                                          traitEdits[fileInfo.url]?.[propertyIndex]?.value ?? value,
                                        )
                                          ? 'border-red-500/50'
                                          : ''
                                      }`}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleTraitChange(
                                          fileInfo.url,
                                          propertyIndex,
                                          'value',
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeTraitFromImage(fileInfo.url, propertyIndex)
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ),
                              )}

                              {/* Add Save Traits button with count */}
                              {hasUnsavedChanges(fileInfo.url) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 gap-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (areAllTraitPairsValid(fileInfo.url)) {
                                      saveTraits(fileInfo.url)
                                    } else {
                                      toast.error('Please fill in all trait fields before saving', {
                                        position: 'bottom-center',
                                      })
                                    }
                                  }}
                                >
                                  Save {Object.keys(fileInfo.properties || {}).length} Traits
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}

                              {/* Show trait count limit warning */}
                              {Object.keys(fileInfo.properties || {}).length >= 10 && (
                                <p className="mt-1 text-xs text-yellow-500">
                                  Maximum trait limit (10) reached
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Step 3: Policy ID */}
      {selectedFiles.length > 0 && thumbnailImage && (
        <Collapsible
          open={openSections.includes(3)}
          onOpenChange={(isOpen) => {
            setOpenSections(isOpen ? [...openSections, 3] : openSections.filter((s) => s !== 3))
          }}
          className="w-full rounded-lg border border-border bg-card"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-secondary/10">
            <h2 className="text-lg font-semibold">Step 3: {steps[2].title}</h2>
            <div className="flex items-center gap-2">
              {isStepComplete(3) && <Check className="h-4 w-4 text-green-500" />}
              <ChevronDown className="h-4 w-4" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 pt-2">
            <div className="flex flex-col gap-4">
              <div className="flex w-full flex-col gap-2">
                <Button3D
                  disabled={!isStepComplete(2) || scanning}
                  onClick={loadPolicies}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base"
                >
                  {scanning ? 'Scanning...' : 'Load Policies'}
                </Button3D>
                <Button3D
                  disabled={!isStepComplete(2) || generatingPolicy}
                  onClick={generatePolicyId}
                  className="flex-1 text-sm sm:text-base"
                >
                  Generate Policy
                </Button3D>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild className="mb-2 w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-center font-normal"
                    disabled={loadingPolicies || policyIds.length === 0}
                  >
                    {selectedPolicy ? (
                      <span>
                        {selectedPolicy.policyId.slice(0, 10)}...{selectedPolicy.policyId.slice(-8)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground sm:text-base">
                        {loadingPolicies ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        ) : policyIds.length === 0 ? (
                          'No policies available'
                        ) : (
                          'Select a policy'
                        )}
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-96 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto">
                  {/* Generated Policies Section */}
                  {policyIds.some((p) => p.isGenerated) && (
                    <>
                      <DropdownMenuLabel className="flex items-center gap-2 font-medium text-emerald-500">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Generated Policies
                      </DropdownMenuLabel>
                      {policyIds
                        .filter((policy) => policy.isGenerated)
                        .map((policy) => (
                          <DropdownMenuItem
                            key={policy.policyId}
                            onClick={() => {
                              // Check if policy is expired
                              const currentSlot = lucid?.currentSlot() || 0
                              const slotsRemaining = policy.slot ? policy.slot - currentSlot : null

                              if (slotsRemaining !== null && slotsRemaining <= 0) {
                                // Show error toast
                                toast.error(
                                  <div className="flex flex-col gap-2">
                                    <p className="font-medium">Policy has expired</p>
                                    <p className="text-sm text-muted-foreground">
                                      This policy (ending in ...{policy.policyId.slice(-8)}) can no
                                      longer be used for minting. Please select or generate a new
                                      policy.
                                    </p>
                                  </div>,
                                  { position: 'bottom-center', duration: 6000 },
                                )

                                // Remove expired policy from state
                                setPolicyIds((prev) =>
                                  prev.filter((p) => p.policyId !== policy.policyId),
                                )

                                // If this was the selected policy, clear the selection
                                if (selectedPolicy?.policyId === policy.policyId) {
                                  setSelectedPolicy(null)
                                }

                                return
                              }

                              setSelectedPolicy(policy)
                            }}
                            className="flex items-center justify-between gap-2 transition-colors hover:bg-emerald-100"
                          >
                            <div className="flex items-center gap-2">
                              {selectedPolicy?.policyId === policy.policyId && (
                                <Check className="h-4 w-4 text-emerald-500" />
                              )}
                              <span
                                className={
                                  selectedPolicy?.policyId === policy.policyId
                                    ? 'text-emerald-500'
                                    : ''
                                }
                              >
                                {policy.policyId.slice(0, 14)}...{policy.policyId.slice(-8)}
                              </span>
                            </div>
                            {policy.slot && (
                              <span
                                className={`text-xs ${
                                  formatExpiryTime(policy.slot) === 'Expired'
                                    ? 'text-destructive'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {formatExpiryTime(policy.slot)}
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                    </>
                  )}

                  {/* Separator between sections if both exist */}
                  {policyIds.some((p) => p.isGenerated) &&
                    policyIds.some((p) => !p.isGenerated) && <DropdownMenuSeparator />}

                  {/* Loaded Policies Section */}
                  {policyIds.some((p) => !p.isGenerated) && (
                    <>
                      <DropdownMenuLabel className="text-blue-500 flex items-center gap-2 font-medium">
                        <div className="bg-blue-500 h-2 w-2 rounded-full" />
                        Loaded Policies
                      </DropdownMenuLabel>
                      {policyIds
                        .filter((policy) => !policy.isGenerated)
                        .map((policy) => (
                          <DropdownMenuItem
                            key={policy.policyId}
                            onClick={async () => {
                              const slot = extractSlotFromScript(policy.script)
                              const currentSlot = lucid?.currentSlot() || 0
                              const slotsRemaining = slot ? slot - currentSlot : null

                              if (slotsRemaining !== null && slotsRemaining <= 0) {
                                toast.error(
                                  <div className="flex flex-col gap-2">
                                    <p className="font-medium">Policy has expired</p>
                                    <p className="text-sm text-muted-foreground">
                                      This policy (ending in ...{policy.policyId.slice(-8)}) can no
                                      longer be used for minting. Please select or generate a new
                                      policy.
                                    </p>
                                  </div>,
                                  { position: 'bottom-center', duration: 6000 },
                                )

                                setPolicyIds((prev) =>
                                  prev.filter((p) => p.policyId !== policy.policyId),
                                )

                                if (selectedPolicy?.policyId === policy.policyId) {
                                  setSelectedPolicy(null)
                                }

                                return
                              }

                              setSelectedPolicy({
                                ...policy,
                                slot: slot,
                              })
                            }}
                            className="hover:bg-blue-100 flex items-center justify-between gap-2 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {selectedPolicy?.policyId === policy.policyId && (
                                <Check className="text-blue-500 h-4 w-4" />
                              )}
                              <span
                                className={
                                  selectedPolicy?.policyId === policy.policyId
                                    ? 'text-blue-500'
                                    : ''
                                }
                              >
                                {policy.policyId.slice(0, 10)}...{policy.policyId.slice(-8)}
                              </span>
                            </div>
                            {policy.slot && (
                              <span
                                className={`text-xs ${
                                  formatExpiryTime(policy.slot) === 'Expired'
                                    ? 'text-destructive'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {formatExpiryTime(policy.slot)}
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                    </>
                  )}
                  {loadingPolicies && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-transparent" />
                      Loading policies...
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm sm:text-base">
                  {expiryConfig.hasExpiry ? 'Policy Expiry' : 'Policy never expires'}
                  {!expiryConfig.hasExpiry && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>
                        Creating a policy with no expiry will just generate the same policy each
                        time.
                      </span>
                    </p>
                  )}
                </Label>
                <Switch
                  checked={expiryConfig.hasExpiry}
                  onCheckedChange={(checked) =>
                    setExpiryConfig((prev) => ({ ...prev, hasExpiry: checked }))
                  }
                />
              </div>

              {expiryConfig.hasExpiry && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[expiryConfig.days]}
                        onValueChange={([days]) => setExpiryConfig((prev) => ({ ...prev, days }))}
                        min={1}
                        max={99999}
                        step={1}
                      />
                    </div>
                    <div className="flex w-32 items-center">
                      <Input
                        type="number"
                        min={1}
                        max={99999}
                        value={expiryConfig.days}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          if (!isNaN(value) && value >= 1 && value <= 99999) {
                            setExpiryConfig((prev) => ({ ...prev, days: value }))
                          }
                        }}
                        className="w-full"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                  {expiryConfig.days >= 99992 ? (
                    <p className="text-xs text-muted-foreground">
                      Policy will expire in ~273 years
                    </p>
                  ) : expiryConfig.days >= 365 ? (
                    <p className="text-xs text-muted-foreground">
                      Policy will expire in {Math.floor(expiryConfig.days / 365)} years
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Policy will expire in {expiryConfig.days} day
                      {expiryConfig.days > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Step 4: Mint! */}
      {selectedPolicy && (
        <Collapsible
          open={openSections.includes(4)}
          onOpenChange={(isOpen) => {
            setOpenSections(isOpen ? [...openSections, 4] : openSections.filter((s) => s !== 4))
          }}
          className="w-full rounded-lg border border-border bg-card"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-secondary/10">
            <h2 className="text-lg font-semibold">Step 4: {steps[3].title}</h2>
            <div className="flex items-center gap-2">
              {isStepComplete(4) && <Check className="h-4 w-4 text-green-500" />}
              <ChevronDown className="h-4 w-4" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 pt-2">
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <label htmlFor="nft-title" className="text-sm font-medium">
                  NFT Title
                </label>
                <Input
                  id="nft-title"
                  type="text"
                  placeholder="Enter NFT title"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  autoFocus
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="nft-description" className="text-sm font-medium">
                  NFT Description
                </label>
                <Input
                  id="nft-description"
                  type="text"
                  placeholder="Enter NFT description"
                  value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="mint-quantity" className="text-sm font-medium">
                  Quantity to Mint
                </label>
                <Input
                  id="mint-quantity"
                  type="number"
                  min="1"
                  max="42069"
                  value={mintQuantity}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseInt(e.target.value)
                    if (value === '' || (!isNaN(value) && value >= 0 && value <= 42069)) {
                      setMintQuantity(value as number)
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value)
                    if (isNaN(value) || value < 1) {
                      setMintQuantity(1)
                    }
                  }}
                  className={`w-full ${mintQuantity > 1 ? 'border-yellow-500' : 'border-border'}`}
                />
                <p className="text-xs text-muted-foreground">Enter a number between 1 and 42069</p>

                {mintQuantity > 1 && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Warning: Minting multiple copies will create a Fungible Token (FT) instead of
                      a Non-Fungible Token (NFT). Each copy will be identical and interchangeable.
                    </span>
                  </div>
                )}
              </div>

              <Button3D
                disabled={!isStepComplete(4) || minting || !api}
                onClick={() => {
                  if (api && nftName && nftDescription && selectedFiles.length > 0) {
                    mintNFT(lucid, api, selectedPolicy, nftName, nftDescription, selectedFiles)
                  } else {
                    if (!nftName || !nftDescription) {
                      toast.error('NFT name and description must be provided', {
                        position: 'bottom-center',
                      })
                    } else {
                      toast.error('Wallet not connected', { position: 'bottom-center' })
                    }
                  }
                }}
                className="w-full"
              >
                {minting ? 'Minting...' : 'Mint NFT'}
              </Button3D>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <Dialog open={showPinataDialog} onOpenChange={setShowPinataDialog}>
        <DialogContent className="flex h-[80vh] w-full max-w-[90vw] flex-col overflow-hidden p-0.5">
          {/* Sticky header */}
          <FilesGridHeader />

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {loadingFiles ? <FileGridSkeleton /> : <FileGrid />}

            {/* No supported files message */}
            {pinataResponse.rows.length > 0 &&
              pinataResponse.rows.filter(
                (file) =>
                  (file.mime_type
                    ? Object.values(VALID_IMAGE_MIMES).includes(file.mime_type)
                    : false) ||
                  VALID_IMAGE_EXTENSIONS.some((ext) =>
                    file.metadata?.name?.toLowerCase().endsWith(ext),
                  ),
              ).length === 0 && (
                <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10" />
                  <p>No supported image files found</p>
                  <p className="text-sm">Supported formats: {formatSupportedExtensions()}</p>
                </div>
              )}
          </div>

          {/* Fixed pagination */}
          <div className="flex w-full items-center justify-center border-t border-border bg-background py-1">
            <Pagination className="!mx-0 overflow-x-auto">
              <PaginationContent className="flex-nowrap gap-0.5 sm:gap-1">
                {/* Only show Previous button if we're not on page 1 */}
                {pagination.currentPage > 1 ? (
                  <PaginationItem className="cursor-pointer select-none">
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      isActive={loadingFiles || pinataResponse.rows.length === 0}
                      className="h-6 px-1.5 text-[10px] sm:h-9 sm:px-3 sm:text-sm"
                    />
                  </PaginationItem>
                ) : (
                  <PaginationItem className="select-none opacity-50">
                    <PaginationPrevious className="h-6 px-1.5 text-[10px] sm:h-9 sm:px-3 sm:text-sm" />
                  </PaginationItem>
                )}

                {/* Generate page numbers */}
                <div className="flex items-center gap-[0.09rem]">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((pageNumber) => {
                      // Always show first and last page
                      if (pageNumber === 1 || pageNumber === pagination.totalPages) return true
                      // Show pages around current page
                      if (Math.abs(pageNumber - pagination.currentPage) <= 1) return true
                      return false
                    })
                    .map((pageNumber, i, array) => (
                      <Fragment key={pageNumber}>
                        {/* Add ellipsis if there's a gap */}
                        {i > 0 && array[i] - array[i - 1] > 1 && (
                          <PaginationItem className="cursor-pointer select-none">
                            <PaginationEllipsis className="h-6 px-1.5 text-[10px] sm:h-9 sm:px-3 sm:text-sm" />
                          </PaginationItem>
                        )}
                        <PaginationItem className="cursor-pointer select-none">
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={pageNumber === pagination.currentPage}
                            className="h-6 w-6 text-[10px] sm:h-9 sm:w-9 sm:text-sm"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      </Fragment>
                    ))}
                </div>

                {pagination.currentPage < pagination.totalPages ? (
                  <PaginationItem className="cursor-pointer select-none">
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      isActive={loadingFiles}
                      className="h-6 px-1.5 text-[10px] sm:h-9 sm:px-3 sm:text-sm"
                    />
                  </PaginationItem>
                ) : (
                  <PaginationItem className="select-none opacity-50">
                    <PaginationNext className="h-6 px-1.5 text-[10px] sm:h-9 sm:px-3 sm:text-sm" />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {selectedForDeletion.length > 0
              ? `Type "confirm" to delete ${selectedForDeletion.length} files.`
              : 'Type "confirm" to delete this file.'}
          </DialogDescription>
          <div className="rounded-lg border border-destructive/20 bg-gradient-to-b from-destructive/5 to-destructive/10 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-destructive">Warning: Permanent Action</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This action cannot be undone. Deleting{' '}
                  {selectedForDeletion.length > 0 ? 'these files' : 'this file'} from Pinata will
                  break any NFTs that use{' '}
                  {selectedForDeletion.length > 0 ? "these files'" : "this file's"} IPFS link. The
                  NFT&apos;s metadata will still point to
                  {selectedForDeletion.length > 0 ? 'these' : 'this'} IPFS{' '}
                  {selectedForDeletion.length > 0 ? 'addresses' : 'address'}, but the content will
                  no longer be available through Pinata.
                </p>
              </div>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (confirmationText.toLowerCase() === 'confirm') {
                if (selectedForDeletion.length > 0) {
                  // Delete multiple files
                  Promise.all(selectedForDeletion.map((hash) => deleteFile(hash)))
                    .then(() => {
                      setSelectedForDeletion([])
                      setIsMultiDeleteMode(false)
                      setIsConfirmDialogOpen(false)
                      setConfirmationText('')
                    })
                    .catch((error) => {
                      toast.error('Error deleting files: ' + error.message, {
                        position: 'bottom-center',
                      })
                    })
                } else {
                  // Delete single file
                  handleDeleteConfirmation()
                }
              }
            }}
          >
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value.toLowerCase())}
              placeholder='Type "confirm" here'
              autoCapitalize="none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmDialogOpen(false)
                  setConfirmationText('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                type="submit"
                disabled={confirmationText.toLowerCase() !== 'confirm'}
              >
                Delete
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
