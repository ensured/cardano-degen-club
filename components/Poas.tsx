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
import { getEpochData } from '@/app/actions'
import copyImagePath from '@/public/copy.png'
// import { Metadata } from '@lucid-evolution/lucid'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Check, ChevronDown, Loader2, Plus, X, Trash2 } from 'lucide-react'
import { timeAgoCompact } from '@/lib/helper'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { AlertCircle } from 'lucide-react'
import { Label } from './ui/label'
import SlotConverter from './SlotConverter'
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

// Update the VALID_IMAGE_MIMES constant to be a Record type
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
]

// Add this constant to define what files can be selected
const VALID_FILE_ACCEPT = [
  // Image MIME types
  ...Object.values(VALID_IMAGE_MIMES),
  // File extensions (for better browser support)
  ...VALID_IMAGE_EXTENSIONS.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`)),
].join(',')

// Update the formatSupportedExtensions helper to handle special cases
const formatSupportedExtensions = () => {
  return ['PNG', 'JPG/JPEG', 'GIF', 'SVG', 'WEBP', 'AVIF', 'TIFF/TIF', 'BMP', 'ICO', 'APNG'].join(
    ', ',
  )
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
  customName?: string // Add this for user-modified names
  traits?: Trait[]
  date_pinned?: string
}

// Update the traits interface near the top with other interfaces
interface Trait {
  key: string
  value: string
}

// Add a helper function to check if it's a CIDv0 hash
const isCIDv0 = (hash: string) => {
  // CIDv0 starts with "Qm" and is 46 characters long
  return hash.startsWith('Qm') && hash.length === 46
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
    itemsPerPage: 6,
  })
  const [lucid, setLucid] = useState<any | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [confirmationText, setConfirmationText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [selectedPinataFiles, setSelectedPinataFiles] = useState<PinataFile[]>([])
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null)
  const [imageNames, setImageNames] = useState<{ [key: string]: string }>({})

  const { width } = useWindowSize()

  // Add function to check step completion
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

  // Replace/combine existing step advancement useEffects with this one
  useEffect(() => {
    // Step 1 -> 2: When API keys are entered
    if (currentStep === 1 && blockfrostKey && pinataJWT) {
      setCurrentStep(2)
      setOpenSections([2])
    }
    // Step 2 -> 3: When URL and thumbnailImage is obtained
    else if (currentStep === 2 && selectedFiles.length > 0 && thumbnailImage) {
      setCurrentStep(3)
      setOpenSections([3])
    }
    // // Step 3 -> 4: When policy is selected
    // else if (currentStep === 3 && selectedPolicyId) {
    // 	setCurrentStep(4)
    // 	setOpenSections([4])
    // }
  }, [blockfrostKey, pinataJWT, selectedFiles, thumbnailImage, currentStep])

  // Load all saved data when component mounts
  useEffect(() => {
    // Load JWT
    const savedJWT = localStorage.getItem('pinataJWT')
    if (savedJWT) setPinataJWT(savedJWT)

    // Load Blockfrost key
    const savedBlockfrost = localStorage.getItem('blockfrostKey')
    if (savedBlockfrost) setBlockfrostKey(savedBlockfrost)

    // If both keys exist, start at step 2
    if (savedJWT && savedBlockfrost) {
      setCurrentStep(2)
      setOpenSections([2])
    }
  }, [])

  // Save JWT whenever it changes
  const handleJWTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPinataJWT(value)
    localStorage.setItem('pinataJWT', value)
  }

  // Add handler for Blockfrost key changes
  const handleBlockfrostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBlockfrostKey(value)
    localStorage.setItem('blockfrostKey', value)
  }

  // Automatically load policies when API is available
  useEffect(() => {
    const initializeWallet = async () => {
      if (walletState.wallet) {
        try {
          console.log('Wallet is available:', walletState.wallet, walletState.balance) // Log wallet state
          const newApi = await walletState.wallet.enable()
          setApi(newApi)

          // Initialize Lucid here
          const { Lucid, Blockfrost } = await getLucid()
          const lucidInstance = await Lucid(
            new Blockfrost(
              `https://cardano-${CARDANO_NETWORK.toLowerCase()}.blockfrost.io/api/v0`,
              blockfrostKey || undefined,
            ),
            CARDANO_NETWORK,
          )
          lucidInstance.selectWallet.fromAPI(newApi)
          setLucid(lucidInstance)

          // // Existing testing code...
          // if (testing) {
          //   const response = await fetch(copyImagePath.src)
          //   const blob = await response.blob()
          //   const file = new File([blob], 'copy.png', { type: 'image/png' })
          //   setFile(file)
          //   await uploadFile(file)
          // }
        } catch (error) {
          console.error('Failed to connect to wallet:', error) // Log error
        } finally {
          setInitializing(false)
        }
      } else {
        console.log('Wallet is not available or component unmounted.') // Log if wallet is not available
      }
    }

    initializeWallet()
  }, [walletState.wallet])

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
      console.log('Starting NFT minting process...')
      const currentSlot = lucid.currentSlot()

      const epochData = await getEpochData(CARDANO_NETWORK)
      console.log('Epoch Data:', epochData)

      const { fromText } = await getScriptUtils()

      if (!thumbnailImage) {
        toast.error('Please select a thumbnail image', { position: 'bottom-center' })
        return
      }

      if (!nftName || !nftDescription) {
        toast.error('Please enter a name and description', { position: 'bottom-center' })
        return
      }

      if (selectedFiles.length === 0) {
        toast.error('Please select at least one image', { position: 'bottom-center' })
        return
      }

      const address = await lucid.wallet().address()

      const newFiles = selectedFiles.map((file) => ({
        mediaType:
          VALID_IMAGE_MIMES[file.name.split('.').pop()?.toLowerCase() || ''] || 'image/png',
        name: file.customName || file.name, // Use customName if available
        src: 'ipfs://' + file.url,
        ...(file.traits?.length
          ? { traits: file.traits.map((trait) => ({ [trait.key]: trait.value })) }
          : {}),
      }))

      // Update the metadata construction with console logs
      const metadata = {
        [selectedPolicy.policyId]: {
          name: nftName,
          description: [nftDescription] as ReadonlyArray<string>,
          image: 'ipfs://' + thumbnailImage,
          mediaType: (() => {
            const thumbnailFile = selectedFiles.find((file) => file.url === thumbnailImage)
            if (!thumbnailFile) return 'image/png'
            const extension = '.' + thumbnailFile.name.split('.').pop()!.toLowerCase()
            const mimeType = VALID_IMAGE_MIMES[extension]
            console.log('Thumbnail extension:', extension)
            console.log('Detected MIME type:', mimeType)
            return mimeType || 'image/png'
          })(),
          files: newFiles,
        },
      } as const

      // Transaction to mint the NFT
      const tx = await lucid
        .newTx()
        .mintAssets({
          [selectedPolicy.policyId + fromText(nftName)]: 1n,
        })
        .attachMetadata(721, metadata) // Attach the Uint8Array metadata with the label 721
        .validTo(Date.now() + 1200000) // 20 minutes for the user to sign the tx
        .pay.ToAddress(address, { [selectedPolicy.policyId + fromText(nftName)]: 1n })
        // .pay.ToAddress(donationAddress, { lovelace: 1000000n })
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
        console.error('Error during NFT minting:', error)
        toast.error('Minting failed: ' + error.message, { position: 'bottom-center' })
      } else {
        console.error('Unexpected error during NFT minting:', error)
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
        data.append('pinataMetadata', JSON.stringify({ name: file.name }))
        data.append('pinataOptions', JSON.stringify({ cidVersion: 0 }))

        const uploadRequest = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
          },
          body: data,
        })

        const response = await uploadRequest.json()
        console.log('Upload Response:', response)

        if (!response.IpfsHash) {
          throw new Error(`Unexpected response format for ${file.name}: IpfsHash not found`)
        }
      })

      // Wait for all uploads to complete
      await Promise.all(uploadPromises)
      let message = 'Files uploaded successfully. Browse uploaded files to select them.'
      if (selectedFiles.length > 1) {
        message = 'Files uploaded successfully. Browse uploaded files to select them.'
      } else if (selectedFiles.length === 1) {
        message = 'File uploaded successfully. Browse uploaded files to select it.'
      }

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

      // Use currentSlot directly
      const currentSlot = lucid.currentSlot() + 86400 // current slot + 1 day

      // Generate policy using currentSlot
      const mintingPolicy = scriptFromNative({
        type: 'all',
        scripts: [
          { type: 'sig', keyHash },
          { type: 'before', slot: currentSlot },
        ],
      })
      const policyId = mintingPolicyToId(mintingPolicy)

      const newPolicy: PolicyInfo = {
        policyId,
        keyHash,
        slot: currentSlot,
        script: {
          type: 'all',
          scripts: [
            { type: 'sig', keyHash },
            { type: 'before', slot: currentSlot },
          ],
        },
        isGenerated: true,
      }

      // Update state with new policy
      setPolicyIds((prev) => [...prev, newPolicy])
      setSelectedPolicy(newPolicy)
      setCurrentStep(4)
      setOpenSections([4])
      toast.success(
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{policyId} will expire in 1 day.</p>
        </div>,
        { position: 'bottom-center' },
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

      const balance = await api.getBalance()
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

      // if (!selectedPolicy && validPolicies.length > 0) {
      // 	setSelectedPolicy(validPolicies[0])
      // }

      if (validPolicies.length === 0) {
        toast.info('No policies found, generate a new policy ID', { position: 'bottom-center' })
      } else {
        toast.success(
          <div className="flex flex-col gap-2">
            Loaded {validPolicies.length} existing policy ID{validPolicies.length > 1 ? 's' : ''}
          </div>,
          { position: 'bottom-center' },
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

      // Fetch all files at once (or a reasonable large number)
      const response = await fetch(
        `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000`,
        {
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
          },
        },
      )

      if (!response.ok) throw new Error('Failed to fetch files')

      const data = await response.json()

      // Filter for valid files
      const validFiles = data.rows
        .filter(
          (file: PinataFile) =>
            isCIDv0(file.ipfs_pin_hash) &&
            ((file.mime_type && Object.values(VALID_IMAGE_MIMES).includes(file.mime_type)) ||
              VALID_IMAGE_EXTENSIONS.some((ext) =>
                file.metadata?.name?.toLowerCase().endsWith(ext),
              )),
        )
        .sort((a: PinataFile, b: PinataFile) => {
          return new Date(b.date_pinned).getTime() - new Date(a.date_pinned).getTime()
        })

      // Calculate pagination
      const totalPages = Math.ceil(validFiles.length / pagination.itemsPerPage)
      const startIndex = (page - 1) * pagination.itemsPerPage
      const endIndex = startIndex + pagination.itemsPerPage

      // Get current page items
      const currentPageItems = validFiles.slice(startIndex, endIndex)

      setPinataResponse({
        count: validFiles.length,
        rows: currentPageItems,
        filteredRows: validFiles,
      })

      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages,
      }))

      if (page === 1) {
        setShowPinataDialog(true)
      }
    } catch (error: any) {
      console.error('Error loading files:', error)
      toast.error('Failed to load files: ' + error.message, { position: 'bottom-center' })
    } finally {
      setLoadingFiles(false)
    }
  }

  // Update the handlePageChange function to prevent invalid navigation
  const handlePageChange = (newPage: number) => {
    if (!pinataResponse.filteredRows) return

    // Prevent going beyond valid pages
    if (newPage < 1 || newPage > pagination.totalPages) return

    const startIndex = (newPage - 1) * pagination.itemsPerPage
    const endIndex = startIndex + pagination.itemsPerPage
    const currentPageItems = pinataResponse.filteredRows.slice(startIndex, endIndex)

    // Only update if we have items for this page
    if (currentPageItems.length > 0) {
      setPinataResponse((prev) => ({
        ...prev,
        rows: currentPageItems,
      }))

      setPagination((prev) => ({
        ...prev,
        currentPage: newPage,
      }))
    }
  }

  const selectPinataFile = (file: PinataFile, isThumbnail: boolean = false) => {
    // Check if the file is already selected
    const isSelected = selectedPinataFiles.some(
      (selectedFile) => selectedFile.ipfs_pin_hash === file.ipfs_pin_hash,
    )

    if (isSelected) {
      // If already selected, remove it from the selection
      setSelectedPinataFiles((prev) =>
        prev.filter((selectedFile) => selectedFile.ipfs_pin_hash !== file.ipfs_pin_hash),
      )
      if (isThumbnail) {
        setThumbnailImage(null) // Clear thumbnail if it's deselected
      }
    } else {
      // If not selected, add it to the selection
      setSelectedPinataFiles((prev) => [...prev, file])
      if (isThumbnail) {
        setThumbnailImage(file.ipfs_pin_hash)
      }
    }
  }

  // Add a button to confirm the selection of files
  const confirmSelection = () => {
    const newFiles = selectedPinataFiles.map((file) => ({
      url: file.ipfs_pin_hash,
      name: file.metadata?.name || `image${Date.now()}`,
    }))
    setSelectedFiles((prev) => [...prev, ...newFiles])
    setShowPinataDialog(false)
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

  // Function to upload the thumbnail image with modified filename
  const uploadThumbnail = async (file: File) => {
    const data = new FormData()
    const newFileName = `${file.name.split('.').slice(0, -1).join('.')}_thumbnail.${file.name.split('.').pop()}` // Append _thumbnail to the filename
    data.append('file', new File([file], newFileName)) // Append the file with the new name
    data.append('pinataMetadata', JSON.stringify({ name: newFileName })) // Add metadata for the file
    data.append('pinataOptions', JSON.stringify({ cidVersion: 0 })) // Add options for the file

    const uploadRequest = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
      },
      body: data,
    })

    const response = await uploadRequest.json()

    // Check if response contains an IpfsHash
    if (!response.IpfsHash) {
      throw new Error(`Unexpected response format for ${file.name}: IpfsHash not found`)
    }

    return response.IpfsHash // Return the IpfsHash for the thumbnail
  }

  const handleTraitChange = (
    fileUrl: string,
    traitIndex: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    setSelectedFiles((prev) =>
      prev.map((fileInfo) => {
        if (fileInfo.url === fileUrl) {
          const traits = [...(fileInfo.traits || [])]
          traits[traitIndex] = {
            ...traits[traitIndex],
            [field]: value,
          }
          return { ...fileInfo, traits }
        }
        return fileInfo
      }),
    )
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

  // Add this function to add a trait to a specific image
  const addTraitToImage = (fileUrl: string) => {
    setSelectedFiles((prev) =>
      prev.map((fileInfo) => {
        if (fileInfo.url === fileUrl) {
          const traits = fileInfo.traits || []
          return { ...fileInfo, traits: [...traits, { key: '', value: '' }] }
        }
        return fileInfo
      }),
    )
  }

  // Add this function to remove a trait from a specific image
  const removeTraitFromImage = (fileUrl: string, traitIndex: number) => {
    setSelectedFiles((prev) =>
      prev.map((fileInfo) => {
        if (fileInfo.url === fileUrl) {
          const traits = fileInfo.traits?.filter((_, index) => index !== traitIndex) || []
          return { ...fileInfo, traits }
        }
        return fileInfo
      }),
    )
  }

  if (initializing || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Connecting to wallet...</p>
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
  return (
    <main className="m-auto flex w-full max-w-3xl flex-col items-center justify-center gap-4 p-4">
      {/* Progress indicator */}
      <TooltipProvider delayDuration={50}>
        <div className="mb-4 flex w-full justify-between px-2">
          {steps.map(({ step, tooltip, title }) => (
            <Tooltip key={step}>
              <TooltipTrigger>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center">
                    {isStepComplete(step) && <Check className="mr-1 h-4 w-4 text-green-500" />}
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
        <CollapsibleContent className="px-6 pb-6">
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
          <CollapsibleContent className="px-6 pb-6">
            <div className="flex flex-col gap-4">
              <Button3D
                disabled={!isStepComplete(1) || loadingFiles}
                onClick={() => loadPinataFiles(1)}
                variant="outline"
              >
                {loadingFiles ? 'Loading Files...' : 'Browse Uploaded Files'}
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

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {selectedFiles.map((fileInfo) => (
                      <div key={fileInfo.url} className="group relative h-full">
                        <div
                          className={`flex h-full cursor-pointer flex-col rounded-lg border p-4 transition-all hover:shadow-lg hover:shadow-primary/5 ${
                            thumbnailImage === fileInfo.url
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            setThumbnailImage(fileInfo.url)
                            toast.success(`Selected ${fileInfo.name} as thumbnail image`, {
                              position: 'bottom-center',
                            })
                          }}
                        >
                          <div className="flex flex-1 flex-col space-y-1">
                            <div className="relative">
                              <Image
                                src={`https://gateway.pinata.cloud/ipfs/${fileInfo.url}`}
                                alt={fileInfo.name}
                                width={200}
                                height={200}
                                className="h-32 w-full rounded-lg object-contain transition-transform group-hover:scale-105"
                              />
                              {thumbnailImage === fileInfo.url && (
                                <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                                  Thumbnail
                                </div>
                              )}
                            </div>

                            <div className="flex flex-1 flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Traits</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 hover:bg-primary/10"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      addTraitToImage(fileInfo.url)
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>

                                {fileInfo.traits?.map((trait, traitIndex) => (
                                  <div key={traitIndex} className="flex items-center gap-2">
                                    <Input
                                      placeholder="Key"
                                      value={trait.key}
                                      className="h-8 text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleTraitChange(
                                          fileInfo.url,
                                          traitIndex,
                                          'key',
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <Input
                                      placeholder="Value"
                                      value={trait.value}
                                      className="h-8 text-xs"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleTraitChange(
                                          fileInfo.url,
                                          traitIndex,
                                          'value',
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeTraitFromImage(fileInfo.url, traitIndex)
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
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
          <CollapsibleContent className="grid grid-cols-2 gap-2 px-6 pb-6">
            <div className="col-span-1 flex flex-col gap-4">
              <div className="flex flex-col gap-2 md:flex-row">
                <Button3D
                  disabled={!isStepComplete(2) || scanning}
                  onClick={loadPolicies}
                  variant="outline"
                  className="flex-1"
                >
                  {scanning ? 'Scanning...' : 'Load Existing Policies'}
                </Button3D>
                <Button3D
                  disabled={!isStepComplete(2) || generatingPolicy}
                  onClick={generatePolicyId}
                  className="flex-1"
                >
                  Generate New Policy
                </Button3D>
              </div>

              <DropdownMenu>
                <Label className="text-lg font-semibold">
                  {policyIds.length !== 0
                    ? `Select Policy ID (${policyIds.length} policies found)`
                    : 'Generate or load a policy'}
                </Label>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                    disabled={loadingPolicies || policyIds.length === 0}
                  >
                    {selectedPolicy ? (
                      <span>
                        {selectedPolicy.policyId.slice(0, 10)}...{selectedPolicy.policyId.slice(-8)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
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
                              setSelectedPolicy(policy)
                            }}
                            className="flex items-center gap-2 transition-colors hover:bg-emerald-100"
                          >
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
                        <div className="h-2 w-2 rounded-full bg-blue" />
                        Loaded Policies
                      </DropdownMenuLabel>
                      {policyIds
                        .filter((policy) => !policy.isGenerated)
                        .map((policy) => (
                          <DropdownMenuItem
                            key={policy.policyId}
                            onClick={async () => {
                              const slot = extractSlotFromScript(policy.script)

                              setSelectedPolicy({
                                ...policy,
                                slot: slot,
                              })
                            }}
                            className="hover:bg-blue-100 flex items-center gap-2 transition-colors"
                          >
                            {selectedPolicy?.policyId === policy.policyId && (
                              <Check className="h-4 w-4 text-blue" />
                            )}
                            <span
                              className={
                                selectedPolicy?.policyId === policy.policyId ? 'text-blue' : ''
                              }
                            >
                              {policy.policyId.slice(0, 10)}...{policy.policyId.slice(-8)}
                            </span>
                          </DropdownMenuItem>
                        ))}
                    </>
                  )}
                  {loadingPolicies && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading policies...
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="col-span-1 flex flex-grow flex-col gap-2">
              {/* <SlotConverter network={CARDANO_NETWORK} defaultSlot={selectedPolicy?.slot || 0} /> */}
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
          <CollapsibleContent className="px-6 pb-6">
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
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <div className="flex w-full items-center justify-between px-4">
              <DialogTitle>
                {width && width > 450 && selectedPinataFiles.length === 0
                  ? 'Select from Pinata files'
                  : width && width < 450 && selectedPinataFiles.length === 0
                    ? 'Select files'
                    : selectedPinataFiles.length === 0
                      ? 'No files selected'
                      : selectedPinataFiles.length === 1
                        ? '1 File Selected'
                        : `${selectedPinataFiles.length} Files Selected`}
              </DialogTitle>
              <Button
                onClick={confirmSelection}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add File{selectedPinataFiles.length === 1 ? '' : 's'}
              </Button>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 p-1 md:grid-cols-3">
            {pinataResponse.rows.map((file) => (
              <div
                key={file.ipfs_pin_hash}
                className={`group relative rounded-md ${
                  selectedPinataFiles.some(
                    (selected) => selected.ipfs_pin_hash === file.ipfs_pin_hash,
                  )
                    ? 'ring-2 ring-primary'
                    : ''
                }`}
                onClick={() => selectPinataFile(file, false)}
              >
                <div className="flex h-full cursor-pointer flex-col rounded-lg border border-border p-4">
                  <div className="flex flex-1 flex-col space-y-1">
                    <div className="relative">
                      <Image
                        src={`https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`}
                        alt={file.metadata?.name || 'Pinata file'}
                        width={200}
                        height={200}
                        className="h-32 w-full rounded-lg object-contain"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="space-y-1">
                        <span className="block truncate text-sm sm:text-base md:text-lg">
                          {(() => {
                            const fullName = file.metadata?.name || file.name || ''
                            return fullName // Return full name including extension
                          })()}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="block text-sm text-muted-foreground sm:text-base md:text-lg">
                            {timeAgoCompact(new Date(file.date_pinned))}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => {
                              e.stopPropagation() // Prevent file selection when clicking delete
                              setFileToDelete(file.ipfs_pin_hash)
                              setIsConfirmDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Update the pagination section */}
          <div className="flex w-full items-center justify-center border-t border-border px-4 py-2">
            <Pagination>
              <PaginationContent>
                {/* Only show Previous button if we're not on page 1 */}
                {pagination.currentPage > 1 ? (
                  <PaginationItem className="cursor-pointer select-none">
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      isActive={loadingFiles || pinataResponse.rows.length === 0}
                    />
                  </PaginationItem>
                ) : (
                  <PaginationItem className="select-none opacity-50">
                    <PaginationPrevious />
                  </PaginationItem>
                )}

                {/* Generate page numbers */}
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
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem className="cursor-pointer select-none">
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={pageNumber === pagination.currentPage}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    </Fragment>
                  ))}

                {/* Only show Next button if we're not on the last page and have a full page of items */}
                {pagination.currentPage < pagination.totalPages &&
                pinataResponse.rows.length === pagination.itemsPerPage ? (
                  <PaginationItem className="cursor-pointer select-none">
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      isActive={loadingFiles || pinataResponse.rows.length === 0}
                    />
                  </PaginationItem>
                ) : (
                  <PaginationItem className="select-none opacity-50">
                    <PaginationNext />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>

          {loadingFiles && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Loading files...</span>
              </div>
            </div>
          )}

          {/* Add a message if no supported files are found */}
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
                <AlertCircle className="h-8 w-8" />
                <p>No supported image files found</p>
                <p className="text-sm">Supported formats: {formatSupportedExtensions()}</p>
              </div>
            )}
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>Type &ldquo;confirm&ldquo; to delete this file.</DialogDescription>
          <div className="rounded-lg border border-destructive/20 bg-gradient-to-b from-destructive/5 to-destructive/10 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-destructive">Warning: Permanent Action</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This action cannot be undone. Deleting this file from Pinata will break any NFTs
                  that use this file&lsquo;s IPFS link. The NFT&lsquo;s metadata will still point to
                  this IPFS address, but the content will no longer be available through Pinata.
                </p>
              </div>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleDeleteConfirmation()
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
                onClick={() => setIsConfirmDialogOpen(false)} // Close dialog without deleting
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirmation}>
                Delete
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
