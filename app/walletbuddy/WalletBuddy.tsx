'use client'
import Animation from '@/components/Animation'
import { toast } from 'sonner'
import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { CopyIcon, CheckIcon, Loader2, XIcon } from 'lucide-react'
import { storeWebhookIdInVercelKV } from '../actions'
import Button3D from '@/components/3dButton'
import blockfrostHighlightImg from '@/public/test2.png'
import Image from 'next/image'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

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
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className="mb-2 block text-sm font-medium">
        {registrationStatus === 'success' || webhookId ? (
          <span className="flex items-center gap-1.5">
            Webhook ID <CheckIcon className="size-4 text-success" />
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            Webhook ID <XIcon className="size-4" />
          </span>
        )}
        <input
          type="text"
          value={webhookId}
          placeholder="35bb67f5-a262-41f0-b22d-6525e8c7cf8b"
          onChange={(e) => setWebhookId(e.target.value)}
          className="bg-base-300 mt-1 block w-full rounded-md border-border/80 p-2"
          required
        />
      </label>
      <p className="text-base-content/70 mt-2 text-sm">
        This identifier will be verified and used to monitor your transactions
      </p>
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Email Address
        <input
          type="email"
          value={email}
          placeholder="your@email.com"
          onChange={(e) => setEmail(e.target.value)}
          className="bg-base-300 mt-1 block w-full rounded-md border-border/80 p-2"
          required
        />
      </label>
      <p className="text-base-content/70 mt-2 text-sm">
        Transaction notifications will be sent to this email address
      </p>
    </div>

    {registrationStatus === 'error' && (
      <div className="bg-error/10 text-error rounded-md p-3 text-sm">❌ Error: {errorMessage}</div>
    )}

    <Button3D disabled={isSubmitting}>
      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
  <div className="bg-base-300 border-gradient-to-r flex items-center justify-between gap-1 rounded-3xl border-2 from-[#ff0000] via-[#00ff00] to-[#0000ff] p-1">
    <code className="break-all p-2">{webhookUrl}</code>
    <button
      onClick={copyToClipboard}
      className="mr-4 rounded-md border border-border/80 bg-accent/50 p-1.5"
      aria-label="Copy webhook URL"
    >
      {copied ? (
        <CheckIcon className="size-5 md:size-6" />
      ) : (
        <CopyIcon className="size-5 md:size-6" />
      )}
    </button>
  </div>
)

const InstructionsList = () => (
  <ol className="mb-6 list-inside list-decimal space-y-4 p-6">
    <li>
      <a
        href="https://blockfrost.io/dashboard/webhooks/add"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        Go to Blockfrost Add Webhook
      </a>
    </li>
    <li>Use any name for Webhook name</li>
    <li>
      Use this webhook URL as the Endpoint URL and change to your email you want to recieve the
      webhook events:
    </li>
    <li>Choose Cardano mainnet</li>
    <li>Select the transaction event for the Trigger</li>
    <li>Add a trigger condition for recipient equal to your wallet address</li>
    <li>Save Webhook</li>
  </ol>
)

const HelpDialog = () => (
  <Dialog>
    <DialogTrigger asChild className="!m-6">
      <Button3D className="font-semibold">Need help finding it?</Button3D>
    </DialogTrigger>
    <DialogContent className="max-w-[100vw] !p-0">
      <VisuallyHidden>
        <DialogTitle>Blockfrost Webhook ID</DialogTitle>
      </VisuallyHidden>
      <div className="mx-auto w-full md:max-w-[90vw] lg:max-w-[80vw]">
        <Image
          src={blockfrostHighlightImg}
          alt="Blockfrost Highlight"
          className="h-full w-full object-contain"
        />
      </div>
      <DialogClose asChild>
        <Button3D className="font-semibold">Close</Button3D>
      </DialogClose>
    </DialogContent>
  </Dialog>
)

const WalletBuddy = () => {
  const [copied, setCopied] = useState(false)
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
    return ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { walletState, loading } = useWallet()

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
      const result = await storeWebhookIdInVercelKV(webhookId, email)

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

  if (!walletState.walletAddress) {
    return (
      <Animation>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-8">
          <h1 className="text-4xl font-bold">Wallet Buddy</h1>
          <p className="text-base-content/70 text-center text-lg">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Connect your wallet to set up transaction notifications'
            )}
          </p>
        </div>
      </Animation>
    )
  }

  return (
    <Animation>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
          {/* Header Section */}
          <header className="space-y-4 text-center">
            <h1 className="text-4xl font-bold">Wallet Buddy</h1>
            <p className="text-base-content/70 text-lg">
              Email notifications for all new incoming transactions
            </p>
          </header>

          {/* Main Content Card */}
          <div className="bg-base-200 overflow-hidden rounded-xl shadow-lg">
            {/* Step 1: Get Webhook URL */}
            <div className="border-base-300 border-b p-6">
              <h2 className="mb-4 text-xl font-semibold">Step 1: Copy Webhook URL</h2>
              <WebhookUrlDisplay
                webhookUrl={webhookUrl}
                copied={copied}
                copyToClipboard={copyToClipboard}
              />
            </div>

            {/* Step 2: Setup Instructions */}
            <div className="border-base-300 border-b p-6">
              <h2 className="mb-4 text-xl font-semibold">Step 2: Configure Blockfrost Webhook</h2>
              <InstructionsList />
              <HelpDialog />
            </div>

            {/* Step 3: Register Webhook */}
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Step 3: Register Your Webhook ID</h2>
              <WebhookRegistrationForm
                webhookId={webhookId}
                setWebhookId={setWebhookId}
                email={email}
                setEmail={setEmail}
                isSubmitting={isSubmitting}
                registrationStatus={registrationStatus}
                errorMessage={errorMessage}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center">
            <p className="text-base-content/70 text-sm">
              Need help? Join our{' '}
              <a href="https://discord.gg/your-discord" className="text-primary hover:underline">
                Discord
              </a>{' '}
              community
            </p>
          </footer>
        </div>
      </div>
    </Animation>
  )
}

export default WalletBuddy
