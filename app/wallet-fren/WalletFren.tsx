'use client'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import {
  CopyIcon,
  CheckIcon,
  Loader2,
  XIcon,
  Link as LucideLinkIcon,
  CheckCircle,
} from 'lucide-react'
import { storeWebhookIdInVercelKV } from '../actions'
import Button3D from '@/components/3dButton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
const WebhookRegistrationForm = ({
  webhookId,
  setWebhookId,
  email,
  setEmail,
  isSubmitting,
  registrationStatus,
  errorMessage,
  handleSubmit,
  otherWalletAddresses,
  setOtherWalletAddresses,
  handleWebhookIdChange,
}: {
  webhookId: string
  setWebhookId: (webhookId: string) => void
  email: string
  setEmail: (email: string) => void
  isSubmitting: boolean
  registrationStatus: 'idle' | 'success' | 'error'
  errorMessage: string
  handleSubmit: (e: React.FormEvent) => Promise<void>
  otherWalletAddresses: string[]
  setOtherWalletAddresses: (addresses: string[]) => void
  handleWebhookIdChange: (webhookId: string) => void
}) => {
  // Add UUID validation function
  const isValidUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  // Add email validation
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const { walletState } = useWallet()

  const handleAddAddress = () => {
    if (otherWalletAddresses.length < 5) {
      setOtherWalletAddresses([...otherWalletAddresses, ''])
    } else {
      toast.error('Maximum of 5 additional addresses allowed', {
        duration: 2000,
      })
    }
  }

  const handleRemoveAddress = (index: number) => {
    setOtherWalletAddresses(otherWalletAddresses.filter((_, i) => i !== index))
  }

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...otherWalletAddresses]
    const trimmedValue = value.trim()

    // Check for duplicates including the main wallet address
    const addressSet = new Set([
      ...(walletState.walletAddress ? [walletState.walletAddress.toLowerCase()] : []),
      ...otherWalletAddresses.map((addr) => addr.toLowerCase()),
    ])

    if (
      addressSet.has(trimmedValue.toLowerCase()) &&
      newAddresses[index].toLowerCase() !== trimmedValue.toLowerCase()
    ) {
      toast.error('This address has already been added', {
        duration: 2000,
      })
      return
    }

    newAddresses[index] = trimmedValue
    setOtherWalletAddresses(newAddresses)
  }

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard!', {
        duration: 2000,
      })
    } catch (err) {
      toast.error('Failed to copy address', {
        duration: 2000,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 lg:space-y-4">
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
        <label className="block">
          {isValidUUID(webhookId) && registrationStatus === 'success' && (
            <div className="absolute -inset-[2px] animate-pulse rounded-xl bg-gradient-to-r from-emerald-400/40 to-teal-400/40" />
          )}
          <div className="relative px-4 py-2">
            <label className="block text-lg font-medium sm:text-xl lg:text-2xl">
              {isValidUUID(webhookId) ? (
                <span className="flex items-center gap-2 text-emerald-400">
                  Webhook ID <CheckIcon className="size-5 text-success" />
                </span>
              ) : (
                <span className="flex items-center gap-2 text-rose-400">
                  Webhook ID <XIcon className="size-5" />
                </span>
              )}
              <Input
                type="text"
                value={webhookId}
                placeholder="35bb67f5-a262-41f0-b22d-6525e8c7cf8b"
                onChange={(e) => {
                  setWebhookId(e.target.value)
                  handleWebhookIdChange(e.target.value)
                }}
                className="mt-2 border-2 border-border/50 bg-background/80 text-lg transition-all hover:border-primary/30 focus:border-primary/50 sm:text-xl lg:text-2xl"
                required
              />
            </label>
          </div>
        </label>

        <div className="relative px-4 py-2">
          <label className="mb-1.5 block text-lg font-medium sm:text-xl lg:text-2xl">
            <span className="flex items-center gap-2">
              Email Address
              {isValidEmail(email) ? (
                <CheckIcon className="size-5 text-emerald-400" />
              ) : (
                <XIcon className="size-5 text-rose-400" />
              )}
            </span>
            <Input
              type="email"
              value={email}
              placeholder="your@email.com"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 border border-border/80 text-base sm:text-lg lg:text-xl"
              required
            />
          </label>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base lg:text-lg">
            Transaction notifications will be sent to this email address
          </p>
        </div>
      </div>

      <div className="relative px-4 py-2">
        <label className="mb-1.5 block text-lg font-medium sm:text-xl lg:text-2xl">
          Wallet Addresses (same as blockfrost webhook)
        </label>
        <div className="space-y-3">
          {otherWalletAddresses.map((address, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={address}
                placeholder="addr1..."
                onChange={(e) => handleAddressChange(index, e.target.value)}
                className="flex-1 border border-border/80 text-base sm:text-lg lg:text-xl"
              />
              {address && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleCopyAddress(address)}
                  className="text-primary hover:text-primary/80"
                >
                  <CopyIcon className="size-5" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleRemoveAddress(index)}
                className="text-rose-400 hover:text-rose-500"
              >
                <XIcon className="size-5" />
              </Button>
            </div>
          ))}
        </div>
        {otherWalletAddresses.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddAddress}
            className="mt-3 w-full"
          >
            Add Another Address
          </Button>
        )}
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base lg:text-lg">
          Monitor up to 5 wallet addresses
        </p>
      </div>

      {registrationStatus === 'error' && (
        <div className="bg-error/10 text-error rounded-md p-2.5 text-sm sm:p-3 sm:text-base lg:text-lg">
          ❌ Error: {errorMessage}
        </div>
      )}

      <Button3D
        className="mt-4 w-full bg-gradient-to-r from-indigo-400 to-purple-300 p-5 text-lg font-medium text-background transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.4)] sm:text-xl lg:text-2xl"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-purple-800 sm:h-6 sm:w-6" />
        )}
        {isSubmitting ? 'Registering...' : 'Register Webhook ID'}
      </Button3D>
    </form>
  )
}

const WebhookUrlDisplay = ({
  webhookUrl,
  copied,
  copyToClipboard,
}: {
  webhookUrl: string
  copied: boolean
  copyToClipboard: (e: React.MouseEvent) => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="group relative flex max-w-full items-center justify-between rounded-xl border-2 border-border/50 bg-background/80 p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)] sm:p-4 lg:p-5">
      {/* Hidden input for mobile devices */}
      <input
        ref={inputRef}
        type="text"
        value={webhookUrl}
        readOnly
        className="absolute h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <code className="flex-1 break-all text-lg sm:text-xl lg:text-2xl">{webhookUrl}</code>
      <button
        onClick={(e) => {
          // Mobile fallback: Select text in hidden input
          inputRef.current?.select()
          inputRef.current?.setSelectionRange(0, 99999)
          copyToClipboard(e)
        }}
        className="ml-3 rounded-lg border-2 border-border/50 bg-accent/20 p-2.5 transition-all hover:bg-accent/40 hover:shadow-sm active:scale-95"
        aria-label="Copy webhook URL"
        type="button"
      >
        {copied ? (
          <CheckIcon className="size-5 animate-pulse text-emerald-400 sm:size-6" />
        ) : (
          <CopyIcon className="size-5 text-primary sm:size-6" />
        )}
      </button>
    </div>
  )
}

const InstructionsList = () => (
  <ol className="mb-6 mt-4 space-y-3 text-lg sm:space-y-4 sm:text-xl lg:space-y-5 lg:text-2xl">
    <li className="flex flex-row items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 text-indigo-300 shadow-sm">
        2
      </span>
      <span className="whitespace-nowrap">Go to </span>
      <Link href="https://blockfrost.io/dashboard/webhooks/add" target="_blank">
        <Button variant="ghost" className="group flex items-center gap-2 px-2 text-lg font-medium">
          <LucideLinkIcon className="h-5 w-5 text-primary transition-transform group-hover:-rotate-12" />
          <span className="whitespace-pre-wrap bg-gradient-to-r from-indigo-300 to-purple-200 bg-clip-text text-left text-transparent">
            Blockfrost <br className="hidden sm:inline" />
            Webhooks
          </span>
        </Button>
      </Link>
    </li>
    <li className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 text-indigo-300 shadow-sm">
        3
      </span>{' '}
      Use this webhook URL as the &lsquo;Endpoint URL&lsquo;
    </li>
    <li className="flex items-center gap-3">
      {' '}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 text-indigo-300 shadow-sm">
        4
      </span>{' '}
      Choose &lsquo;Cardano Mainnet&lsquo; as Network
    </li>
    <li className="flex items-center gap-3">
      {' '}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 text-indigo-300 shadow-sm">
        5
      </span>{' '}
      Choose Transaction for &lsquo;Trigger&lsquo;
    </li>
    <li className="flex items-center gap-3">
      {' '}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 text-indigo-300 shadow-sm">
        6
      </span>{' '}
      Add a trigger condition for recipient equal to your wallet address
    </li>
    <li className="flex items-center gap-3">
      {' '}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 text-indigo-300 shadow-sm">
        7
      </span>{' '}
      Save Webhook
    </li>
  </ol>
)

const WalletFren = () => {
  // auth stuff
  const { user } = useUser()
  const userEmail = user?.externalAccounts[0].emailAddress
  const webhookUrl = 'https://cardanodegen.shop/api/transactions-monitor'
  const [webhookId, setWebhookId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('webhookId') || ''
    }
    return ''
  })
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('webhookEmail') || ''
    }
    return userEmail || ''
  })
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { walletState, loading } = useWallet()
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [otherWalletAddresses, setOtherWalletAddresses] = useState<string[]>(() => {
    if (typeof window !== 'undefined' && webhookId) {
      const savedAddresses = localStorage.getItem(webhookId)
      if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses)
        return addresses.filter((addr: string) => addr !== walletState.walletAddress)
      } else {
        return [walletState.stakeAddress || '']
      }
    }
    return []
  })

  // Modify the webhook ID setter to trigger address loading
  const handleWebhookIdChange = (newWebhookId: string) => {
    setWebhookId(newWebhookId)

    if (typeof window !== 'undefined') {
      if (newWebhookId) {
        const savedAddresses = localStorage.getItem(newWebhookId)
        if (savedAddresses) {
          const addresses = JSON.parse(savedAddresses)
          // Ensure we include both saved addresses and current wallet address
          const uniqueAddresses = [
            ...new Set([
              ...(walletState.walletAddress ? [walletState.walletAddress] : []),
              ...addresses,
            ]),
          ]
          setOtherWalletAddresses(uniqueAddresses)
        } else {
          setOtherWalletAddresses(walletState.walletAddress ? [walletState.walletAddress] : [])
        }
      } else {
        setOtherWalletAddresses(walletState.walletAddress ? [walletState.walletAddress] : [])
      }
    }
  }

  // Save addresses whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && webhookId) {
      const addressSet = new Set([
        ...(walletState.walletAddress ? [walletState.walletAddress] : []),
        ...otherWalletAddresses,
      ])
      localStorage.setItem(webhookId, JSON.stringify([...addressSet]))
    }
  }, [otherWalletAddresses, walletState.walletAddress, webhookId])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
  }, [])

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Copy button clicked') // Debug log

    try {
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        toast.error('Clipboard access requires HTTPS', { duration: 3000 })
        return
      }

      // Modern clipboard API
      if (navigator.clipboard) {
        console.log('Using modern clipboard API')
        await navigator.clipboard.writeText(webhookUrl)
      } else {
        // Fallback for older browsers
        console.log('Using legacy execCommand')
        const textarea = document.createElement('textarea')
        textarea.value = webhookUrl
        textarea.style.position = 'fixed'
        textarea.style.top = '0'
        textarea.style.left = '0'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()

        const success = document.execCommand('copy')
        document.body.removeChild(textarea)

        if (!success) throw new Error('execCommand failed')
      }

      console.log('Copy successful')
      setCopied(true)

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy error:', err)
      toast.error('Failed to copy - check console', {
        position: 'top-center',
        duration: 3000,
        icon: <XIcon className="h-5 w-5 text-rose-400" />,
      })

      // Fallback: Show text for manual copy
      const input = document.createElement('input')
      input.value = webhookUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setRegistrationStatus('idle')
    setErrorMessage('')

    try {
      const result = await storeWebhookIdInVercelKV(webhookId, email, userTimezone, [
        walletState.stakeAddress || '',
        ...otherWalletAddresses,
      ])

      if (result.success) {
        setRegistrationStatus('success')
        localStorage.setItem('webhookId', webhookId)
        localStorage.setItem('webhookEmail', email)
        if (result.exists) {
          toast.success('Webhook ID already exists! Email updated successfully.')
        } else {
          toast.success('Webhook registered successfully!')
        }
      } else {
        setRegistrationStatus('error')
        setErrorMessage(result.error || 'Registration failed')
        toast.error(result.error || 'Error registering webhook')
      }
    } catch (error) {
      setRegistrationStatus('error')
      setErrorMessage('An unexpected error occurred')
      toast.error('Failed to register webhook')
    } finally {
      setIsSubmitting(false)
    }
  }
  const header = (
    <div className="mx-auto mt-4 w-full max-w-4xl px-4">
      <div className="hover:shadow-3xl rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-8 shadow-2xl backdrop-blur-lg transition-all sm:p-10 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e510_1px,transparent_1px)] bg-[length:20px_20px] opacity-20" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <h1 className="bg-gradient-to-r from-indigo-300 to-purple-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-sm [text-shadow:_0_2px_4px_rgba(0,0,0,0.2)] sm:text-5xl lg:text-6xl">
            Wallet Fren
          </h1>

          <div className="mt-2 space-y-2">
            {!walletState.walletAddress && !userEmail ? (
              <p className="text-lg text-gray-300 sm:text-xl lg:text-2xl">
                {loading ? (
                  <Loader2 className="ml-4 mt-2 inline-block h-10 w-10 animate-spin text-purple-300 sm:h-12 sm:w-12" />
                ) : (
                  'Connect your wallet or sign in to enable real-time transaction alerts'
                )}
                <br className="hidden sm:block" />
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-emerald-400 sm:h-7 sm:w-7" />
                <p className="text-xl font-medium text-gray-200 sm:text-2xl lg:text-3xl">
                  Transaction Monitoring
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (!walletState.walletAddress && !userEmail) {
    return header
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900/20 to-purple-900/20 pb-8">
      <div className="mx-auto mt-6 w-full max-w-4xl px-4">
        {header}
        <div className="hover:shadow-3xl mt-8 overflow-hidden rounded-2xl border-2 border-border/50 bg-background/80 shadow-2xl backdrop-blur-sm transition-all sm:rounded-3xl">
          <div className="border-b-2 border-border/50 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl lg:text-2xl">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 text-indigo-300 shadow-sm">
                  1
                </span>{' '}
                Copy Webhook URL
              </h2>
              <span className="text-sm text-muted-foreground sm:text-base">Step 1 of 2</span>
            </div>
            <WebhookUrlDisplay
              webhookUrl={webhookUrl}
              copied={copied}
              copyToClipboard={copyToClipboard}
            />
            <InstructionsList />
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-xl font-semibold sm:text-2xl lg:text-3xl">Register your ID</h2>
              <span className="text-sm text-muted-foreground sm:text-base">Step 2 of 2</span>
            </div>
            <WebhookRegistrationForm
              handleWebhookIdChange={handleWebhookIdChange}
              webhookId={webhookId}
              setWebhookId={handleWebhookIdChange}
              email={userEmail ?? email}
              setEmail={setEmail}
              isSubmitting={isSubmitting}
              registrationStatus={registrationStatus}
              errorMessage={errorMessage}
              handleSubmit={handleSubmit}
              otherWalletAddresses={otherWalletAddresses}
              setOtherWalletAddresses={setOtherWalletAddresses}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletFren
