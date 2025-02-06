'use client'
import Animation from '@/components/Animation'
import { toast } from 'sonner'
import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { CopyIcon, CheckIcon, Loader2 } from 'lucide-react'

const WalletBuddy = () => {
  const [copied, setCopied] = useState(false)
  const webhookUrl =
    'https://cardanodegen.shop/api/transaction-monitor?email=_youremail@example.com'

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    toast.success('Webhook URL copied to clipboard!')
    setTimeout(() => setCopied(false), 1100)
  }

  const { walletState, loading } = useWallet()

  return (
    <Animation>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        {walletState.walletAddress && (
          <div className="mx-auto flex flex-col items-center justify-center gap-6 p-4">
            <div className="mx-auto flex flex-col items-center justify-center gap-6 p-4">
              <h2 className="text-2xl font-bold">Coming soon!</h2>
            </div>
            {/* <div className="mx-auto flex flex-col items-center justify-center gap-6 p-4">
          <h1 className="text-3xl font-bold">Wallet Buddy Webhook Service</h1>


          <div className="bg-base-200 w-full rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">Set Up Your Webhook</h2>

            <ol className="mb-6 list-inside list-decimal space-y-4">
              <li>
                Go to{' '}
                <a 
                  href="https://blockfrost.io/dashboard/webhooks/add"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Blockfrost Add Webhook
                </a>
              </li>
              <li>Use any name for Webhook name</li>
              <li>
                Use this webhook URL as the Endpoint URL and change to your email you want to
                recieve the webhook events:
              </li>
              <div className="bg-base-300 flex items-center justify-between gap-1 rounded-lg border border-border/80 p-4">
                <code className="break-all">{webhookUrl}</code>
                <button
                  onClick={copyToClipboard}
                  className="rounded-md border border-border/80 bg-background/90 p-1.5"
                  aria-label="Copy webhook URL"
                >
                  {copied ? (
                    <CheckIcon size={22} className="bg-accent/90" />
                  ) : (
                    <CopyIcon size={22} className="bg-accent/90" />
                  )}
                </button>
              </div>
              <li>Choose Cardano mainnet</li>
              <li>Select the transaction event for the Trigger</li>
              <li>Add a trigger condition for recipient equal to your wallet address</li>
              <li>Save Webhook</li>
            </ol>
          </div>

          <div className="bg-base-200 w-full rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">Features</h2>
            <ul className="list-inside list-disc space-y-2">
              {/* <li>Automatic storage of webhook events</li> 
              {/* // implement later as well as a dashboard for the user to see the webhook events. 
              <li>Transaction history tracking</li>
              <li>Real-time event processing</li>
              <li>Maintains last 1000 transactions</li>
            </ul>
          </div>

          <div className="text-base-content/70 text-center text-sm">
            Need help? Join our{' '}
            <a href="https://discord.gg/your-discord" className="text-primary hover:underline">
              Discord
            </a>{' '}
            community
          </div>
          */}
          </div>
        )}

        {!walletState.walletAddress && (
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-4">
            <h1 className="text-3xl font-bold">Wallet Buddy Webhook Service</h1>
            <p className="text-base-content/70 text-center text-sm">
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Please connect your wallet to continue'
              )}
            </p>
          </div>
        )}
      </div>
    </Animation>
  )
}

export default WalletBuddy
