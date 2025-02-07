'use client'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
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
}: {
  webhookId: string
  setWebhookId: (webhookId: string) => void
  email: string
  setEmail: (email: string) => void
  isSubmitting: boolean
  registrationStatus: 'idle' | 'success' | 'error'
  errorMessage: string
  handleSubmit: (e: React.FormEvent) => Promise<void>
}) => (
  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
    <div>
      <label className="mb-1.5 block text-base font-medium sm:text-lg lg:text-xl">
        {registrationStatus === 'success' || webhookId ? (
          <span className="flex items-center gap-1.5 text-lg sm:text-xl lg:text-2xl">
            Webhook ID <CheckIcon className="size-4 text-success sm:size-5 lg:size-6" />
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-lg sm:text-xl lg:text-2xl">
            Webhook ID <XIcon className="size-4 sm:size-5 lg:size-6" />
          </span>
        )}
        <Input
          type="text"
          value={webhookId}
          placeholder="35bb67f5-a262-41f0-b22d-6525e8c7cf8b"
          onChange={(e) => setWebhookId(e.target.value)}
          className="mt-1.5 border border-border/80 text-base sm:text-lg lg:text-xl"
          required
        />
      </label>
    </div>

    <div>
      <label className="mb-1.5 block text-lg font-medium sm:text-xl lg:text-2xl">
        Email Address
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

    {registrationStatus === 'error' && (
      <div className="bg-error/10 text-error rounded-md p-2.5 text-sm sm:p-3 sm:text-base lg:text-lg">
        ❌ Error: {errorMessage}
      </div>
    )}

    <Button3D
      className="mt-2 p-4 text-lg sm:p-5 sm:text-xl lg:p-6 lg:text-2xl"
      disabled={isSubmitting}
    >
      {isSubmitting && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
      )}
      {isSubmitting ? 'Registering...' : 'Register Webhook ID'}
    </Button3D>
  </form>
)

const WebhookUrlDisplay = ({
  webhookUrl,
  copied,
  copyToClipboard,
}: {
  webhookUrl: string
  copied: boolean
  copyToClipboard: () => void
}) => (
  <div className="flex max-w-full items-center justify-between rounded-lg border border-border/80 bg-background p-2.5 shadow-sm sm:p-3.5 lg:p-4">
    <code className="flex-1 break-all text-base sm:text-lg lg:text-xl">{webhookUrl}</code>
    <button
      onClick={copyToClipboard}
      className="ml-2 rounded-md border border-border/80 bg-accent/50 p-2 transition-colors hover:bg-accent/70 sm:ml-3 sm:p-2.5 lg:p-3"
      aria-label="Copy webhook URL"
    >
      {copied ? (
        <CheckIcon className="size-4 sm:size-5 lg:size-6" />
      ) : (
        <CopyIcon className="size-4 sm:size-5 lg:size-6" />
      )}
    </button>
  </div>
)

const InstructionsList = () => (
  <ol className="mb-4 mt-3 list-inside space-y-1.5 text-base sm:mb-6 sm:mt-4 sm:space-y-2 sm:text-lg lg:space-y-3 lg:text-xl">
    <li className="flex items-center">
      2. Go to{' '}
      <Link
        href="https://blockfrost.io/dashboard/webhooks/add"
        target="_blank"
        className="ml-1 text-primary hover:underline"
      >
        <Button variant={'link'} className="flex items-center gap-1 !px-1">
          <LucideLinkIcon className="h-4 w-4" /> Blockfrost Webhooks
        </Button>
      </Link>
    </li>
    <li>3. Use this webhook URL as the &lsquo;Endpoint URL&lsquo;</li>
    <li>4. Choose &lsquo;Cardano Mainnet&lsquo; as Network</li>
    <li>5. Choose Transaction for &lsquo;Trigger&lsquo;</li>
    <li>6. Add a trigger condition for recipient equal to your wallet address</li>
    <li>7. Save Webhook</li>
  </ol>
)

const WalletBuddy = () => {
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
  }, [])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    toast.success('Webhook URL copied to clipboard!')
    setTimeout(() => setCopied(false), 1100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setRegistrationStatus('idle')
    setErrorMessage('')

    try {
      const result = await storeWebhookIdInVercelKV(webhookId, email, userTimezone)

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
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 shadow-xl backdrop-blur-sm sm:p-8 lg:p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="bg-gradient-to-r from-indigo-300 to-purple-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl">
            Wallet Fren
            {loading && (
              <Loader2 className="ml-3 mt-2 inline-block h-8 w-8 animate-spin text-purple-300 sm:h-10 sm:w-10" />
            )}
          </h1>

          <div className="mt-2 space-y-2">
            {!walletState.walletAddress && !userEmail ? (
              <p className="text-lg text-gray-300 sm:text-xl lg:text-2xl">
                Connect your wallet or sign in to enable
                <br className="hidden sm:block" /> real-time transaction alerts
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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="mx-auto mt-3 flex w-full max-w-3xl flex-col">
        {header}

        {/* Main Content Card */}
        <div className="overflow-hidden rounded-lg bg-background shadow-md sm:rounded-xl">
          {/* Step 2: Setup Instructions */}
          <div className="border-b border-border p-4 sm:p-5 lg:p-6">
            <h2 className="mb-2 text-base font-medium sm:mb-3 sm:text-xl">1. Copy Webhook URL</h2>
            <WebhookUrlDisplay
              webhookUrl={webhookUrl}
              copied={copied}
              copyToClipboard={copyToClipboard}
            />
            <InstructionsList />
          </div>

          {/* Step 3: Register Webhook */}
          <div className="p-4 sm:p-5 lg:p-6">
            <h2 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl lg:text-3xl">
              Register your ID
            </h2>
            <WebhookRegistrationForm
              webhookId={webhookId}
              setWebhookId={setWebhookId}
              email={userEmail ?? email}
              setEmail={setEmail}
              isSubmitting={isSubmitting}
              registrationStatus={registrationStatus}
              errorMessage={errorMessage}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletBuddy
