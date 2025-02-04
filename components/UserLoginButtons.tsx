'use client'
import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, EyeOff, GlobeIcon, Loader2, UserIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { UserButton as ClerkUserButton, useUser, useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Web2LoginButton from '@/components/Web2LoginButton'
import WalletConnect from '@/components/WalletConnect'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { dark } from '@clerk/themes'
import { useWallet } from '@/contexts/WalletContext'
import { TransactionMonitor } from './TransactionMonitor'

export default function UserLoginButtons({ extraText }: { extraText?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const [currentPath, setCurrentPath] = useState(pathname)
  const { openUserProfile, signOut } = useClerk()
  const { user } = useUser()
  const { walletState, loading } = useWallet()
  const [hiddenEmail, setHiddenEmail] = useState('')
  const userEmail = user?.externalAccounts[0].emailAddress
  const [isWalletAddressVisible, setIsWalletAddressVisible] = useState(true)
  const [isAdaHandleVisible, setIsAdaHandleVisible] = useState(true)
  const [blockfrostApiKey, setBlockfrostApiKey] = useState('')
  useEffect(() => {
    setCurrentPath(pathname)
  }, [pathname])

  // useEffect for setting the current blockfrostApiKey from localstorage as soon as it's available
  useEffect(() => {
    const blockfrostApiKey = window.localStorage.getItem('blockfrostKey')
    if (blockfrostApiKey) {
      setBlockfrostApiKey(blockfrostApiKey)
    }
  }, [])

  useEffect(() => {
    if (userEmail) {
      setHiddenEmail(userEmail.slice(0, 3) + '...' + userEmail.slice(userEmail.indexOf('@') - 2))
    } else {
      setHiddenEmail('')
    }
  }, [userEmail])

  const handleUserButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openUserProfile()
  }

  const handleSignOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    signOut()
  }

  const web2Image = user?.imageUrl

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        {walletState.walletAddress && walletState.walletIcon ? (
          <Button
            variant={
              (walletState.adaHandle?.handle && isAdaHandleVisible) ||
              (isWalletAddressVisible && !walletState.adaHandle?.handle)
                ? 'outline'
                : 'ghost'
            }
            className={`flex items-center gap-1 ${
              (walletState.adaHandle?.handle && isAdaHandleVisible) ||
              (isWalletAddressVisible && !walletState.adaHandle?.handle)
                ? 'bg-secondary/55'
                : 'bg-background'
            } text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white ${
              (walletState.adaHandle?.handle && isAdaHandleVisible) ||
              (isWalletAddressVisible && !walletState.adaHandle?.handle)
                ? 'px-2'
                : ''
            }`}
            size={
              (walletState.adaHandle?.handle && isAdaHandleVisible) ||
              (isWalletAddressVisible && !walletState.adaHandle?.handle)
                ? 'sm'
                : 'smIcon'
            }
            aria-label="User login options"
          >
            {walletState.adaHandle?.handle && isAdaHandleVisible && (
              <span className="line-clamp-1">
                <span className="text-sm dark:text-white/70 sm:text-base">{`$${walletState.adaHandle.handle}`}</span>
              </span>
            )}

            {!walletState.adaHandle?.handle &&
              isWalletAddressVisible &&
              `${walletState?.walletAddress?.slice(0, 6)}...${walletState?.walletAddress?.slice(-4)}`}

            {walletState.walletIcon && (
              <Image src={walletState.walletIcon} alt="wallet icon" width={28} height={28} />
            )}
          </Button>
        ) : isSignedIn ? (
          <div style={{ cursor: 'pointer' }}>
            {loading ? (
              <Loader2 className="size-5 animate-spin sm:size-6" />
            ) : web2Image ? (
              <Image src={web2Image} alt="user avatar" width={28} height={28} />
            ) : (
              <UserIcon className="size-5 sm:size-6" />
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size={`${!extraText ? 'icon' : 'default'}`}
            aria-label="User login options"
          >
            <div className="text-md flex items-center gap-2 sm:text-base">
              {loading ? (
                <Loader2 className="size-5 animate-spin sm:size-6" />
              ) : (
                <UserIcon className="size-5 sm:size-6" />
              )}
              {extraText ? extraText : ''}
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[19rem] sm:w-[19.5rem] md:w-[20rem]"
        align="center"
        sideOffset={4}
        alignOffset={0}
      >
        <div className="flex flex-col gap-4 rounded-lg p-4">
          {/* web3 wallet login */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="flex items-center text-lg font-semibold text-foreground/90">
              <div className="flex items-center gap-2">
                <GlobeIcon className="size-5" />
                Web3 Login
              </div>
              <button
                onClick={() => {
                  if (walletState.adaHandle?.handle) {
                    setIsAdaHandleVisible(!isAdaHandleVisible)
                  } else {
                    setIsWalletAddressVisible(!isWalletAddressVisible)
                  }
                }}
                className="group ml-2"
              >
                {(walletState.adaHandle?.handle ? isAdaHandleVisible : isWalletAddressVisible) ? (
                  <>
                    <div className="group-hover:hidden">
                      <Eye />
                    </div>
                    <div className="hidden group-hover:block">
                      <EyeOff />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="group-hover:hidden">
                      <EyeOff />
                    </div>
                    <div className="hidden group-hover:block">
                      <Eye />
                    </div>
                  </>
                )}
              </button>
            </h3>
            <WalletConnect
              className="w-full rounded-md bg-secondary/50 p-4 transition-colors hover:bg-secondary"
              aria-label="Web3 Login Button"
              setIsAdaHandleVisible={setIsAdaHandleVisible}
              setIsWalletAddressVisible={setIsWalletAddressVisible}
              isAdaHandleVisible={isAdaHandleVisible}
              isWalletAddressVisible={isWalletAddressVisible}
            />
          </div>
          {/* web2 wallet login*/}
          <div className="flex flex-col items-center gap-4 border-t border-border/30 pt-6">
            <h2 className="flex items-center text-lg font-semibold text-foreground/90">
              <UserIcon className="mr-2 size-5" />
              Web2 Login
            </h2>
            {isSignedIn ? (
              <div className="flex w-full flex-col items-center gap-3">
                <div
                  onClick={handleUserButtonClick}
                  className="w-full cursor-pointer rounded-lg bg-secondary/50 p-2 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <ClerkUserButton
                      appearance={{
                        baseTheme: theme === 'dark' ? dark : undefined,
                        elements: {
                          userButtonAvatarBox: {
                            width: '2.5rem',
                            height: '2.5rem',
                          },
                          userButtonBox: {
                            width: '100%',
                          },
                        },
                      }}
                    />
                    {hiddenEmail && (
                      <span className="text-sm text-muted-foreground">{hiddenEmail}</span>
                    )}
                  </div>
                </div>
                <Button variant="destructive" onClick={handleSignOut} size="sm" className="w-full">
                  Logout
                </Button>
              </div>
            ) : (
              <Web2LoginButton currentPath={currentPath} />
            )}
          </div>
          {/* {blockfrostApiKey ? (
            <div className="mt-4 w-full border-t border-border/30 pt-4">
              <h3 className="mb-2 text-sm font-semibold">Transaction Monitoring</h3>
              {walletState.walletAddress && (
                <TransactionMonitor
                  address={walletState.walletAddress}
                  blockfrostKey={blockfrostApiKey}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Loader2 className="size-5 animate-spin sm:size-6" />
            </div>
          )} */}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
