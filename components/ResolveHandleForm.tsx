/* eslint-disable tailwindcss/enforces-shorthand */
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, XSquareIcon } from "lucide-react";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { decode as cborDecode } from "cbor-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BaseAddress, Address } from "@emurgo/cardano-serialization-lib-asmjs";

type ResolveHandleFormProps = {
  handleSubmit: () => void;
  walletAddress: {
    stakeAddress: string;
    image: string;
    address: string;
  } | null;
  loadingAdahandle: boolean;
  handleName: string;
  setHandleName: (name: string) => void;
};

interface Cardano {
  [key: string]:
    | {
        apiVersion: string;
        enable: () => Promise<any>;
        name: string;
        icon: string;
        getBalance?: () => Promise<number>;
        getUsedAddresses?: () => Promise<string[]>;
      }
    | undefined;
}

declare global {
  interface Window {
    cardano?: Cardano;
  }
}

// Function to decode hexadecimal address to Bech32
const decodeHexAddress = (hexAddress: string): string => {
  try {
    // Convert the hex string to a byte array
    const bytes = Buffer.from(hexAddress, "hex");

    // Create an Address from the byte array
    const address = Address.from_bytes(bytes);

    // Check if the address is a BaseAddress
    const baseAddress = BaseAddress.from_address(address);
    if (!baseAddress) {
      return address.to_bech32();
    }

    // // Extract payment and stake credentials
    // const paymentCredential = baseAddress.payment_cred()
    // const stakeCredential = baseAddress.stake_cred()

    // Convert to Bech32 format
    return baseAddress.to_address().to_bech32();
  } catch (error) {
    console.error("Error decoding address:", error);
    return hexAddress; // Return the original hex if there's an error
  }
};

const WalletConnect = () => {
  const [walletState, setWalletState] = useState<{
    wallet: string | null;
    supportedWallets: string[];
    dropdownVisible: boolean;
    walletIcon: string | null;
    walletName: string | null;
    walletAddress: string | null;
    walletAddresses: string[];
    balance: string | null;
    walletImages: string[];
  }>({
    wallet: null,
    supportedWallets: [],
    dropdownVisible: false,
    walletIcon: null,
    walletName: null,
    walletAddress: "",
    walletAddresses: [],
    balance: null,
    walletImages: [],
  });

  const handleConnect = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (walletState.dropdownVisible) {
      // If the dropdown is already visible, close it
      setWalletState((prev) => ({
        ...prev,
        dropdownVisible: false,
      }));
    } else {
      // If the dropdown is not visible, open it and fetch wallet names
      if (window.cardano) {
        const walletNames = Object.keys(window.cardano).filter(
          (key) => (window.cardano as Cardano)[key]?.apiVersion !== undefined,
        );

        setWalletState((prev) => ({
          ...prev,
          supportedWallets: walletNames,
          dropdownVisible: true,
        }));
      } else {
        setWalletState((prev) => ({
          ...prev,
          supportedWallets: [],
          dropdownVisible: false,
        }));
      }
    }
  };

  const handleWalletConnect = async (wallet: string) => {
    if (window.cardano) {
      const walletInstance = await window.cardano[wallet]?.enable();
      const walletData = window.cardano[wallet];
      const walletName = walletData?.name || null;
      const walletIcon = walletData?.icon || null;

      const balanceResponse = await walletInstance.getBalance();

      try {
        // wallet balance
        const balanceBytes = Buffer.from(balanceResponse, "hex");
        const uint8Array = new Uint8Array(balanceBytes);
        const arrayBuffer = uint8Array.buffer;
        const decodedBalance = (
          cborDecode(arrayBuffer)[0] / 1000000
        ).toLocaleString();

        // wallet addresses
        const walletAddresses = await walletInstance.getUsedAddresses();

        // Process each address and try both formats
        const humanReadableAddresses = walletAddresses
          .slice(0, 136)
          .map((address: string) => {
            let bech32Address;
            if (/^[0-9a-fA-F]+$/.test(address)) {
              // If the address is in hexadecimal format
              bech32Address = decodeHexAddress(address);
            } else {
              // If the address is already in bech32 format
              bech32Address = address;
            }
            return bech32Address;
          });

        setWalletState((prev) => ({
          ...prev,
          wallet: walletInstance,
          walletIcon,
          walletName,
          walletAddress: humanReadableAddresses[0],
          walletAddresses: humanReadableAddresses,
          dropdownVisible: false,
          balance: decodedBalance,
          walletImages: walletIcon
            ? [...prev.walletImages, walletIcon]
            : prev.walletImages,
        }));
      } catch (error) {
        console.error("Error decoding balance:", error);
      }
    }
  };

  return (
    <div className=" my-2 flex w-full flex-col items-center justify-center gap-2 p-2 rounded-md">
      <div className="relative">
        <Button
          variant="outline"
          onClick={handleConnect}
          size={"lg"}
          className="flex flex-row items-center gap-2 text-xl"
        >
          <p className="text-sm">{walletState.balance}</p>
          {walletState.walletName ? (
            <>
              {walletState.walletIcon && (
                <Image
                  src={walletState.walletIcon}
                  alt="wallet icon"
                  width={32}
                  height={32}
                />
              )}
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>

        {walletState.dropdownVisible &&
          walletState.supportedWallets.length > 0 && (
            <Card className="absolute z-50 mt-0.5 w-full rounded-md bg-background shadow-lg">
              <CardHeader className="">
                <CardTitle>Select a Wallet</CardTitle>
                <CardDescription>
                  Choose from the available wallets below:
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {Array.from(
                  new Set(
                    walletState.supportedWallets.map(
                      (wallet) => window.cardano?.[wallet]?.icon,
                    ),
                  ),
                ) // Get unique wallet icons
                  .filter((icon) => icon !== undefined) // Filter out any undefined icons
                  .map((icon) => {
                    const wallet = Object.keys(window.cardano || {}).find(
                      (key) => {
                        const cardanoWallet = window.cardano?.[key] as
                          | Cardano
                          | undefined; // Type assertion
                        return (
                          cardanoWallet !== undefined &&
                          cardanoWallet.icon === icon
                        ); // Check if cardanoWallet is defined
                      },
                    ); // Find the wallet name by icon
                    const walletName = wallet
                      ? wallet.charAt(0).toUpperCase() +
                        wallet.slice(1).toLowerCase()
                      : "";

                    return (
                      <div
                        key={wallet}
                        onClick={() => wallet && handleWalletConnect(wallet)}
                        className="flex w-full cursor-pointer flex-row items-center justify-center gap-1 rounded-sm border border-border p-4 px-0 text-lg md:text-xl"
                      >
                        {icon && (
                          <Image
                            src={icon}
                            alt={`${walletName} icon`}
                            width={30}
                            height={30}
                            className="size-7 md:size-8"
                          />
                        )}
                        {/* wallet name */}
                        <span>{walletName}</span>{" "}
                        {/* Optionally keep the wallet name for context */}
                      </div>
                    );
                  })}
              </CardContent>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center rounded-b-sm rounded-t-none border-x-0 border-b-0 border-t p-1 text-xl hover:bg-secondary/80"
                onClick={() =>
                  setWalletState((prev) => ({
                    ...prev,
                    dropdownVisible: false,
                  }))
                }
              >
                <XSquareIcon className="size-5 text-gray-600 dark:text-gray-400" />
              </Button>
            </Card>
          )}
      </div>
      <p className="container flex flex-row items-center justify-center break-all text-sm">
        {walletState.walletAddress}
      </p>
    </div>
  );
};

const ResolveHandleForm = ({
  handleSubmit,
  walletAddress,
  loadingAdahandle,
  handleName,
  setHandleName,
}: ResolveHandleFormProps) => {
  return (
    <div className="container">
      <WalletConnect />
      <form
        className="col-span-1 flex w-full flex-col items-center justify-center gap-2 bg-secondary/40 p-5 sm:p-8 "
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex flex-row items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="36"
            viewBox="0 0 28 44"
          >
            <path
              id="logo_S"
              data-name="logo S"
              d="M6.847,2.28q0-.819,1.269-1.531A6.543,6.543,0,0,1,11.458,0q1.6,0,2.071.713a1.691,1.691,0,0,1,.333.926V2.707a11.626,11.626,0,0,1,5.245,1.5c.4.284.6.558.6.818a10.97,10.97,0,0,1-.835,3.988q-.8,2.137-1.568,2.138a4.05,4.05,0,0,1-.869-.321A9.124,9.124,0,0,0,12.76,9.793a4.669,4.669,0,0,0-1.97.284.954.954,0,0,0-.5.891c0,.38.246.678.735.891a10.607,10.607,0,0,0,1.8.569,12.063,12.063,0,0,1,2.372.749,13.116,13.116,0,0,1,2.4,1.281A5.632,5.632,0,0,1,19.442,16.7a6.6,6.6,0,0,1,.735,2.991,10.022,10.022,0,0,1-.268,2.528,7.742,7.742,0,0,1-.936,2.065A5.961,5.961,0,0,1,17,26.206a9.615,9.615,0,0,1-3.141,1.212v.569q0,.819-1.269,1.531a6.531,6.531,0,0,1-3.34.747q-1.6,0-2.071-.711a1.7,1.7,0,0,1-.335-.926V27.56a21.3,21.3,0,0,1-3.775-.676Q0,25.995,0,24.961a16.977,16.977,0,0,1,.534-4.13q.535-2.172,1.269-2.173.133,0,2.772.962a12.92,12.92,0,0,0,3.976.962,3.425,3.425,0,0,0,1.736-.284,1.077,1.077,0,0,0,.4-.891c0-.38-.246-.7-.735-.962a6.491,6.491,0,0,0-1.838-.676A15.515,15.515,0,0,1,3.34,15.74a5.472,5.472,0,0,1-1.836-2.1A6.823,6.823,0,0,1,.768,10.4q0-6.553,6.079-7.655Z"
              transform="translate(0 9.487)"
              fill="#0cd15b"
            ></path>
          </svg>
          <Input
            type="text"
            placeholder="$adahandle"
            value={handleName}
            className="w-60 text-base md:text-xl"
            onChange={(e) => setHandleName(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="w-[16.23rem]"
          disabled={
            loadingAdahandle || handleName === "" || handleName.length < 2
          }
        >
          <span className="relative flex flex-row items-center gap-2">
            <span className="whitespace-nowrap">Search</span>
            <span className="flex items-center">
              {loadingAdahandle && (
                <Loader2 className="absolute -right-3.5 size-5 animate-spin text-white" />
              )}
            </span>
          </span>
        </Button>
      </form>
      {walletAddress?.stakeAddress && (
        <div className="col-span-1 overflow-hidden break-all border-t border-border bg-secondary/40 p-6 text-center shadow-md">
          <div className="z-20">
            <Image
              src={
                walletAddress.image && walletAddress.image.startsWith("ipfs://")
                  ? `https://ipfs.io/ipfs/${walletAddress.image.replace("ipfs://", "")}`
                  : walletAddress.image
              }
              width={800}
              height={800}
              alt="wallet image"
              className="col-span-1 mx-auto mb-1 size-36 object-cover sm:mb-0"
            />
            <div className="col-span-1 flex flex-col sm:p-2">
              <span className="flex items-center justify-center gap-1 text-muted-foreground">
                <span className="text-base sm:text-lg">Stake Address</span>{" "}
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6 sm:h-[1.6rem] sm:w-[1.55rem]"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress.stakeAddress);
                    toast.success("Copied stake address");
                  }}
                >
                  <CopyIcon className="size-3 sm:size-3.5" />
                </Button>
              </span>
              <span className="line-clamp-1 text-center sm:line-clamp-3">
                {walletAddress.stakeAddress}
              </span>
            </div>
            <div className="col-span-1 flex flex-col sm:p-2">
              <span className="flex items-center justify-center gap-1 text-muted-foreground">
                <span className="text-base sm:text-lg">Address</span>{" "}
                <Button
                  size="icon"
                  className="h-6 w-6 sm:size-[1.55rem]"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress.address);
                    toast.success("Copied address");
                  }}
                >
                  <CopyIcon className="size-3 sm:size-3.5" />
                </Button>
              </span>
              <span className="line-clamp-1 text-center sm:line-clamp-3">
                {walletAddress
                  ? walletAddress.address
                  : "No wallet address found"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResolveHandleForm;
