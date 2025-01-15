'use client'

import { useWallet, WalletContextType } from '@/contexts/WalletContext'
import Image from 'next/image'
import { useState, useEffect } from 'react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

const testing = false

type CardanoNetwork = 'Mainnet' | 'Preview' | 'Preprod'
export const CARDANO_NETWORK: CardanoNetwork = 'Preview'

const getLucid = async () => {
  const { Lucid, Blockfrost } = await import('@lucid-evolution/lucid')
  return { Lucid, Blockfrost }
}

const getScriptUtils = async () => {
  const { scriptFromNative, paymentCredentialOf, unixTimeToSlot, mintingPolicyToId, fromText } =
    await import('@lucid-evolution/lucid')
  return {
    scriptFromNative,
    paymentCredentialOf,
    unixTimeToSlot,
    mintingPolicyToId,
    fromText,
  }
}

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { AlertCircle } from 'lucide-react'
import { Label } from './ui/label'
import SlotConverter from './SlotConverter'

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
  metadata: {
    name: string
  }
  mime_type: string
  size: number
  date_pinned: string
}

// Add these interfaces near the top with other interfaces
interface PinataResponse {
  count: number
  rows: PinataFile[]
}

interface PaginationState {
  currentPage: number
  totalPages: number
  itemsPerPage: number
}

// Add these constants near the top of the component
const VALID_IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/tiff',
  'image/bmp',
  'image/x-icon',
  'image/apng',
]

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
  ...VALID_IMAGE_MIMES,
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
  if (VALID_IMAGE_MIMES.includes(file.type)) {
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

// Utility function to mint the NFT
const mintNFT = async (
  lucid: any,
  api: WalletApi,
  selectedPolicy: PolicyInfo,
  nftName: string,
  nftDescription: string,
  url: string,
) => {
  try {
    console.log('Starting NFT minting process...')
    const currentSlot = await lucid.currentSlot()
    console.log('Current Slot:', currentSlot)

    const epochData = await getEpochData(CARDANO_NETWORK)
    console.log('Epoch Data:', epochData)

    const { scriptFromNative, fromText } = await getScriptUtils()

    const metadata = {
      [selectedPolicy.policyId]: {
        [nftName]: {
          name: nftName,
          description: nftDescription,
          image: `ipfs://${url}`,
          mediaType: 'image/png',
        },
      },
    }

    // const donationAddress =
    // 	CARDANO_NETWORK === 'Mainnet'
    // 		? 'addr1qxyj9sqrzpwq9v4ylzr3m59rzxcusdqytulpz8j8wpd7k75ya8f335kz79mf43nwquzgnylgzmt0wdyh2k2zzleh7c7qmkdw9a'
    // 		: 'addr_test1qrmm28eu9n4payu3sghjg7rpl2jqcdyl43sl3aezrqyx3gjxl4hjnhrmtcs6xnayrndwqfawlet6cr6upcnws30ujp9setmuen'

    const tx = await lucid
      .newTx()
      .mintAssets({
        [selectedPolicy.policyId + fromText(nftName)]: 1n,
      })
      .attachMetadata(721, metadata)
      .validTo(Date.now() + 1200000)
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

    return txHash
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during NFT minting:', error)
      toast.error('Minting failed: ' + error.message, { position: 'bottom-center' })
    } else {
      console.error('Unexpected error during NFT minting:', error)
      toast.error('Minting failed: An unexpected error occurred.', { position: 'bottom-center' })
    }
  }
}

export default function Poas() {
  const [file, setFile] = useState<File>()
  const [url, setUrl] = useState<string | null>(null)
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
  const [pinataResponse, setPinataResponse] = useState<PinataResponse>({ count: 0, rows: [] })
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12,
  })
  const [lucid, setLucid] = useState<any | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [confirmationText, setConfirmationText] = useState('')

  // Add function to check step completion
  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return Boolean(blockfrostKey && pinataJWT)
      case 2:
        return Boolean(url && file)
      case 3:
        return Boolean(selectedPolicy)
      case 4:
        return Boolean(selectedPolicy && nftName && nftDescription && url)
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
    // Step 2 -> 3: When URL is obtained
    else if (currentStep === 2 && url) {
      setCurrentStep(3)
      setOpenSections([3])
    }
    // // Step 3 -> 4: When policy is selected
    // else if (currentStep === 3 && selectedPolicyId) {
    // 	setCurrentStep(4)
    // 	setOpenSections([4])
    // }
  }, [blockfrostKey, pinataJWT, url, selectedPolicy, currentStep])

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
    let mounted = true

    const initializeWallet = async () => {
      if (mounted && walletState.wallet) {
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

          // Existing testing code...
          if (testing) {
            const response = await fetch(copyImagePath.src)
            const blob = await response.blob()
            const file = new File([blob], 'copy.png', { type: 'image/png' })
            setFile(file)
            await uploadFile(file)
          }
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
    return () => {
      mounted = false
    }
  }, [walletState.wallet])

  const uploadFile = async (selectedFile?: File) => {
    try {
      if (!selectedFile) {
        toast.error('No file selected', { position: 'bottom-center' })
        return
      }

      // Check if file type is valid before attempting upload
      if (!isValidImageFile(selectedFile)) {
        toast.error(
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              Upload Blocked: Invalid File Format
            </div>
            <p className="text-sm">&quot;{selectedFile.name}&quot; cannot be uploaded.</p>
            <p className="text-sm text-muted-foreground">
              Supported formats: {formatSupportedExtensions()}
            </p>
          </div>,
          { position: 'bottom-center' },
        )
        return
      }

      setUploading(true)
      const data = new FormData()
      data.set('file', selectedFile)

      const uploadRequest = await fetch('/api/ipfs/pin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
        },
        body: data,
      })
      const response = await uploadRequest.json()
      setUrl(response.IpfsHash)

      // Set default NFT name and description based on file name
      const baseName = selectedFile.name
        .split('.')[0]
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .replace(/\b\w/g, (c) => c.toUpperCase()) // Capitalize first letter of each word

      setNftName(baseName)
      setNftDescription(baseName)

      setUploading(false)
    } catch (e) {
      console.log(e)
      setUploading(false)
      toast.error('Trouble uploading file to IPFS', { position: 'bottom-center' })
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0]

    if (selectedFile && !isValidImageFile(selectedFile)) {
      toast.error(
        <div className="flex flex-col gap-2">
          <p>Invalid file type</p>
          <p className="text-sm text-muted-foreground">
            Supported formats: JPG, PNG, GIF, WebP, AVIF, SVG, TIFF, BMP
          </p>
          <p className="text-xs text-muted-foreground">
            Selected file: {selectedFile.name} ({selectedFile.type || 'unknown type'})
          </p>
        </div>,
        { position: 'bottom-center' },
      )
      return
    }

    setFile(selectedFile)
    // submit if there's an api key and a file
    if (pinataJWT && selectedFile) {
      await uploadFile(selectedFile)
    } else {
      console.log('Upload conditions not met:', {
        hasPinataJWT: Boolean(pinataJWT),
        hasFile: Boolean(selectedFile),
        fileType: selectedFile?.type,
        fileName: selectedFile?.name,
      })
      toast.error('Please enter a Pinata JWT and select a file', { position: 'bottom-center' })
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
    if (!pinataJWT) {
      toast.error('Please enter Pinata JWT first', { position: 'bottom-center' })
      return
    }

    try {
      setLoadingFiles(true)
      const response = await fetch(
        `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=${pagination.itemsPerPage}&pageOffset=${(page - 1) * pagination.itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${pinataJWT}`,
          },
        },
      )

      if (!response.ok) throw new Error('Failed to fetch files')

      const data = await response.json()
      setPinataResponse(data)
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(data.count / prev.itemsPerPage),
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

  const selectPinataFile = async (file: PinataFile) => {
    // More robust check for image files
    const isImage =
      file.mime_type?.startsWith('image/') ||
      VALID_IMAGE_EXTENSIONS.some((ext) => file.metadata?.name?.toLowerCase().endsWith(ext))

    if (!isImage) {
      toast.error(
        <div className="flex flex-col gap-2">
          <p>Invalid file type</p>
          <p className="text-sm text-muted-foreground">
            Supported formats: JPG, PNG, GIF, WebP, AVIF, SVG, TIFF, BMP
          </p>
          <p className="text-xs text-muted-foreground">
            Selected file type: {file.mime_type || 'unknown'}
          </p>
        </div>,
        { position: 'bottom-center' },
      )
      return
    }

    const ipfsHash = file.ipfs_pin_hash
    setUrl(ipfsHash)
    setShowPinataDialog(false)

    try {
      // Fetch the actual file from IPFS
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
      const blob = await response.blob()

      // Create a proper File object
      const properFile = new File([blob], file.metadata.name, { type: file.mime_type })
      setFile(properFile)

      // Set default NFT name and description based on file name
      const baseName = file.metadata.name.split('.')[0]
      setNftName(baseName)
      setNftDescription(baseName)

      // Force step advancement
      setCurrentStep(3)
      setOpenSections([3])
    } catch (error) {
      console.error('Error creating file:', error)
      toast.error('Error loading file from IPFS', { position: 'bottom-center' })
    }
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
    setPinataResponse((prev) => ({
      ...prev,
      rows: prev.rows.filter((file) => file.ipfs_pin_hash !== cid), // Filter out the deleted file
    }))

    try {
      const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, options)
      const result = await response.text() // Use .text() to get the response as plain text

      if (response.ok) {
        toast.success('File deleted successfully', { position: 'bottom-center' })
      } else {
        // Revert the optimistic update if the delete fails
        setPinataResponse((prev) => ({
          ...prev,
          rows: previousFiles, // Restore previous state
        }))
        toast.error('Failed to delete file: ' + result, { position: 'bottom-center' })
      }
    } catch (error) {
      // Revert the optimistic update if an error occurs
      setPinataResponse((prev) => ({
        ...prev,
        rows: previousFiles, // Restore previous state
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
    }
    setIsConfirmDialogOpen(false) // Close the dialog
  }

  useEffect(() => {
    if (!selectedPolicy && currentStep === 4) {
      setCurrentStep(3)
      setOpenSections([3])
    }
  }, [selectedPolicy, currentStep])

  if (initializing) {
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
                />
                <Button3D
                  disabled={!isStepComplete(1) || uploading || !file}
                  onClick={() => uploadFile(file)}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button3D>
              </div>

              {/* File preview section */}
              {url && (
                <div className="mt-2 flex items-center gap-4 rounded-lg bg-secondary/20 p-4">
                  {file?.type.startsWith('image/') ? (
                    <Image
                      src={`https://gateway.pinata.cloud/ipfs/${url}`}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="text-sm">File: {file?.name}</div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-muted-foreground">
                      IPFS Hash: {url.slice(0, 20)}...
                    </div>
                    <div className="text-sm text-muted-foreground">IPFS Type: {file?.type}</div>
                    <div className="text-sm text-muted-foreground">File Name: {file?.name}</div>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Step 3: Policy ID */}
      {url && (
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
              <div className="flex gap-4">
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
              <div className="space-y-2">
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

              <div className="space-y-2">
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
                  if (api && nftName && nftDescription && url) {
                    mintNFT(lucid, api, selectedPolicy, nftName, nftDescription, url)
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
            <DialogTitle>Select from Pinata Files</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3">
            {pinataResponse.rows
              // Filter to only show supported files
              .filter((file) => {
                const isValidMime = VALID_IMAGE_MIMES.includes(file.mime_type)
                const isValidExtension = VALID_IMAGE_EXTENSIONS.some((ext) =>
                  file.metadata?.name?.toLowerCase().endsWith(ext),
                )
                return isValidMime || isValidExtension
              })
              .map((file) => (
                <div
                  key={file.ipfs_pin_hash}
                  onClick={() => selectPinataFile(file)}
                  className="cursor-pointer rounded-lg border border-border p-4 transition-colors hover:border-primary"
                >
                  <div className="space-y-2">
                    <Image
                      src={`https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`}
                      alt={file.metadata?.name || 'Pinata file'}
                      width={200}
                      height={200}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    <p className="truncate text-sm">{file.metadata?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.date_pinned).toLocaleDateString()}
                    </p>
                    <Button
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering the selectPinataFile function
                        setFileToDelete(file.ipfs_pin_hash) // Set the file to delete
                        setIsConfirmDialogOpen(true) // Open the confirmation dialog
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* Add pagination controls */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPinataFiles(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loadingFiles}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPinataFiles(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || loadingFiles}
            >
              Next
            </Button>
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
                VALID_IMAGE_MIMES.includes(file.mime_type) ||
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
          <p>Type &ldquo;confirm&ldquo; to delete this file.</p>
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
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)} // Close dialog without deleting
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmationText.toLowerCase() !== 'confirm'}
                type="submit"
                className="ml-2"
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
