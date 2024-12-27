import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState } from "react"

type WalletSelectionCardProps = {
  supportedWallets: string[]
  onWalletSelect: (wallet: string) => void
}

export function WalletSelectionCard({
  supportedWallets,
  onWalletSelect,
}: WalletSelectionCardProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Select Wallet</CardTitle>
        <CardDescription>Choose a wallet to connect.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="wallet">Wallet</Label>
          <Select>
            <SelectTrigger id="wallet">
              <SelectValue placeholder="Select a wallet" />
            </SelectTrigger>
            <SelectContent position="popper">
              {supportedWallets.map((wallet) => (
                <SelectItem
                  key={wallet}
                  value={wallet}
                  onClick={() => {
                    setSelectedWallet(wallet)
                    console.log(`Selected wallet: ${wallet}`)
                  }}
                >
                  {wallet} {wallet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => console.log("Cancel")}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            console.log(`Connecting to wallet: ${selectedWallet}`)
            if (selectedWallet) {
              onWalletSelect(selectedWallet)
            } else {
              console.warn("No wallet selected!")
            }
          }}
        >
          Connect
        </Button>
      </CardFooter>
    </Card>
  )
}
